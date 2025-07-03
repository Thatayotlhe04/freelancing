from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime, date
import os
import uuid
import json
from bson import json_util

app = FastAPI(title="Financial Roadmap API", version="1.0.0")

# Custom JSON encoder for MongoDB objects
def parse_json(data):
    return json.loads(json_util.dumps(data))

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# MongoDB connection
MONGO_URL = os.environ.get('MONGO_URL', 'mongodb://localhost:27017')
client = AsyncIOMotorClient(MONGO_URL)
db = client.financial_roadmap

# Pydantic models
class IncomeEntry(BaseModel):
    id: Optional[str] = None
    amount: float
    source: str  # trading, freelancing, selling_phones, etc.
    description: Optional[str] = None
    date: date
    created_at: Optional[datetime] = None

class ExpenseEntry(BaseModel):
    id: Optional[str] = None
    amount: float
    category: str  # wifi, gym, trading_accounts, tuition_deposits, etc.
    description: Optional[str] = None
    date: date
    created_at: Optional[datetime] = None

class Milestone(BaseModel):
    id: Optional[str] = None
    target_amount: float
    title: str
    description: Optional[str] = None
    achieved: bool = False
    achieved_date: Optional[date] = None

class JournalEntry(BaseModel):
    id: Optional[str] = None
    title: str
    content: str
    date: date
    mood: Optional[str] = None  # positive, negative, neutral
    created_at: Optional[datetime] = None

# Initialize milestones
@app.on_event("startup")
async def startup_event():
    # Create default milestones if they don't exist
    milestones_collection = db.milestones
    existing_milestones = await milestones_collection.count_documents({})
    
    if existing_milestones == 0:
        default_milestones = [
            {"id": str(uuid.uuid4()), "target_amount": 100000, "title": "First P100k", "description": "Quarter way to the goal!", "achieved": False},
            {"id": str(uuid.uuid4()), "target_amount": 500000, "title": "Tuition Secured", "description": "Enough for UCT tuition!", "achieved": False},
            {"id": str(uuid.uuid4()), "target_amount": 1000000, "title": "First Million", "description": "Halfway there!", "achieved": False},
            {"id": str(uuid.uuid4()), "target_amount": 1500000, "title": "P1.5M Milestone", "description": "Three quarters done!", "achieved": False},
            {"id": str(uuid.uuid4()), "target_amount": 2000000, "title": "Mission Complete", "description": "Full P2M achieved - UCT here we come!", "achieved": False},
        ]
        await milestones_collection.insert_many(default_milestones)

# API Routes

# Dashboard/Summary endpoint
@app.get("/api/dashboard")
async def get_dashboard():
    # Get total income
    income_pipeline = [
        {"$group": {"_id": None, "total": {"$sum": "$amount"}}}
    ]
    income_result = await db.income.aggregate(income_pipeline).to_list(1)
    total_income = income_result[0]["total"] if income_result else 0
    
    # Get total expenses
    expense_pipeline = [
        {"$group": {"_id": None, "total": {"$sum": "$amount"}}}
    ]
    expense_result = await db.expenses.aggregate(expense_pipeline).to_list(1)
    total_expenses = expense_result[0]["total"] if expense_result else 0
    
    # Net progress
    net_progress = total_income - total_expenses
    
    # Progress percentage
    goal_amount = 2000000  # P2M
    progress_percentage = (net_progress / goal_amount) * 100
    
    # Get recent entries
    recent_income = await db.income.find().sort("created_at", -1).limit(5).to_list(5)
    recent_expenses = await db.expenses.find().sort("created_at", -1).limit(5).to_list(5)
    
    # Get milestones
    milestones = await db.milestones.find().sort("target_amount", 1).to_list(10)
    
    return {
        "total_income": total_income,
        "total_expenses": total_expenses,
        "net_progress": net_progress,
        "goal_amount": goal_amount,
        "progress_percentage": min(progress_percentage, 100),
        "recent_income": recent_income,
        "recent_expenses": recent_expenses,
        "milestones": milestones
    }

# Income endpoints
@app.post("/api/income")
async def add_income(entry: IncomeEntry):
    entry.id = str(uuid.uuid4())
    entry.created_at = datetime.now()
    
    await db.income.insert_one(entry.dict())
    return {"message": "Income entry added successfully", "id": entry.id}

@app.get("/api/income")
async def get_income():
    income_entries = await db.income.find().sort("date", -1).to_list(100)
    return income_entries

@app.delete("/api/income/{entry_id}")
async def delete_income(entry_id: str):
    result = await db.income.delete_one({"id": entry_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Income entry not found")
    return {"message": "Income entry deleted successfully"}

# Expense endpoints
@app.post("/api/expenses")
async def add_expense(entry: ExpenseEntry):
    entry.id = str(uuid.uuid4())
    entry.created_at = datetime.now()
    
    await db.expenses.insert_one(entry.dict())
    return {"message": "Expense entry added successfully", "id": entry.id}

@app.get("/api/expenses")
async def get_expenses():
    expense_entries = await db.expenses.find().sort("date", -1).to_list(100)
    return expense_entries

@app.delete("/api/expenses/{entry_id}")
async def delete_expense(entry_id: str):
    result = await db.expenses.delete_one({"id": entry_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Expense entry not found")
    return {"message": "Expense entry deleted successfully"}

# Milestone endpoints
@app.get("/api/milestones")
async def get_milestones():
    milestones = await db.milestones.find().sort("target_amount", 1).to_list(10)
    return milestones

@app.put("/api/milestones/{milestone_id}")
async def update_milestone(milestone_id: str, milestone: Milestone):
    result = await db.milestones.update_one(
        {"id": milestone_id},
        {"$set": milestone.dict(exclude_unset=True)}
    )
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Milestone not found")
    return {"message": "Milestone updated successfully"}

# Journal endpoints
@app.post("/api/journal")
async def add_journal_entry(entry: JournalEntry):
    entry.id = str(uuid.uuid4())
    entry.created_at = datetime.now()
    
    await db.journal.insert_one(entry.dict())
    return {"message": "Journal entry added successfully", "id": entry.id}

@app.get("/api/journal")
async def get_journal_entries():
    journal_entries = await db.journal.find().sort("date", -1).to_list(100)
    return journal_entries

@app.delete("/api/journal/{entry_id}")
async def delete_journal_entry(entry_id: str):
    result = await db.journal.delete_one({"id": entry_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Journal entry not found")
    return {"message": "Journal entry deleted successfully"}

# Analytics endpoints
@app.get("/api/analytics/income-sources")
async def get_income_by_source():
    pipeline = [
        {"$group": {"_id": "$source", "total": {"$sum": "$amount"}, "count": {"$sum": 1}}}
    ]
    result = await db.income.aggregate(pipeline).to_list(10)
    return result

@app.get("/api/analytics/monthly-progress")
async def get_monthly_progress():
    pipeline = [
        {
            "$group": {
                "_id": {
                    "year": {"$year": "$date"},
                    "month": {"$month": "$date"}
                },
                "income": {"$sum": "$amount"}
            }
        },
        {"$sort": {"_id.year": 1, "_id.month": 1}}
    ]
    income_data = await db.income.aggregate(pipeline).to_list(20)
    
    # Get expenses by month
    expense_pipeline = [
        {
            "$group": {
                "_id": {
                    "year": {"$year": "$date"},
                    "month": {"$month": "$date"}
                },
                "expenses": {"$sum": "$amount"}
            }
        },
        {"$sort": {"_id.year": 1, "_id.month": 1}}
    ]
    expense_data = await db.expenses.aggregate(expense_pipeline).to_list(20)
    
    return {
        "income_by_month": income_data,
        "expenses_by_month": expense_data
    }

@app.get("/api/health")
async def health_check():
    return {"status": "healthy", "message": "Financial Roadmap API is running"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)