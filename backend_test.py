import requests
import json
from datetime import datetime, date
import sys

class FinancialRoadmapTester:
    def __init__(self, base_url):
        self.base_url = base_url
        self.tests_run = 0
        self.tests_passed = 0
        self.income_id = None
        self.expense_id = None
        self.journal_id = None

    def run_test(self, name, method, endpoint, expected_status, data=None):
        """Run a single API test"""
        url = f"{self.base_url}/{endpoint}"
        headers = {'Content-Type': 'application/json'}
        
        self.tests_run += 1
        print(f"\n🔍 Testing {name}...")
        
        try:
            if method == 'GET':
                response = requests.get(url, headers=headers)
            elif method == 'POST':
                response = requests.post(url, json=data, headers=headers)
            elif method == 'PUT':
                response = requests.put(url, json=data, headers=headers)
            elif method == 'DELETE':
                response = requests.delete(url, headers=headers)

            success = response.status_code == expected_status
            if success:
                self.tests_passed += 1
                print(f"✅ Passed - Status: {response.status_code}")
                try:
                    return success, response.json()
                except:
                    return success, {}
            else:
                print(f"❌ Failed - Expected {expected_status}, got {response.status_code}")
                try:
                    print(f"Response: {response.json()}")
                except:
                    print(f"Response: {response.text}")
                return False, {}

        except Exception as e:
            print(f"❌ Failed - Error: {str(e)}")
            return False, {}

    def test_health_check(self):
        """Test the health check endpoint"""
        success, response = self.run_test(
            "Health Check",
            "GET",
            "api/health",
            200
        )
        return success

    def test_dashboard(self):
        """Test the dashboard endpoint"""
        success, response = self.run_test(
            "Dashboard",
            "GET",
            "api/dashboard",
            200
        )
        if success:
            print(f"Dashboard data: Progress {response.get('progress_percentage', 0):.2f}%, " +
                  f"Net Progress: {response.get('net_progress', 0)} BWP")
            print(f"Total Income: {response.get('total_income', 0)} BWP, " +
                  f"Total Expenses: {response.get('total_expenses', 0)} BWP")
            print(f"Milestones: {len(response.get('milestones', []))}")
        return success

    def test_add_income(self, amount, source, description="Test income"):
        """Test adding income"""
        data = {
            "amount": amount,
            "source": source,
            "description": description,
            "date": date.today().isoformat()
        }
        success, response = self.run_test(
            f"Add Income ({source}: {amount} BWP)",
            "POST",
            "api/income",
            200,
            data=data
        )
        if success and 'id' in response:
            self.income_id = response['id']
            print(f"Created income with ID: {self.income_id}")
        return success

    def test_get_income(self):
        """Test getting income entries"""
        success, response = self.run_test(
            "Get Income Entries",
            "GET",
            "api/income",
            200
        )
        if success:
            print(f"Retrieved {len(response)} income entries")
        return success

    def test_add_expense(self, amount, category, description="Test expense"):
        """Test adding expense"""
        data = {
            "amount": amount,
            "category": category,
            "description": description,
            "date": date.today().isoformat()
        }
        success, response = self.run_test(
            f"Add Expense ({category}: {amount} BWP)",
            "POST",
            "api/expenses",
            200,
            data=data
        )
        if success and 'id' in response:
            self.expense_id = response['id']
            print(f"Created expense with ID: {self.expense_id}")
        return success

    def test_get_expenses(self):
        """Test getting expense entries"""
        success, response = self.run_test(
            "Get Expense Entries",
            "GET",
            "api/expenses",
            200
        )
        if success:
            print(f"Retrieved {len(response)} expense entries")
        return success

    def test_get_milestones(self):
        """Test getting milestones"""
        success, response = self.run_test(
            "Get Milestones",
            "GET",
            "api/milestones",
            200
        )
        if success:
            print(f"Retrieved {len(response)} milestones")
            for milestone in response:
                print(f"  - {milestone.get('title')}: {milestone.get('target_amount')} BWP")
        return success

    def test_add_journal(self, title, content, mood="neutral"):
        """Test adding journal entry"""
        data = {
            "title": title,
            "content": content,
            "mood": mood,
            "date": date.today().isoformat()
        }
        success, response = self.run_test(
            f"Add Journal Entry ({title})",
            "POST",
            "api/journal",
            200,
            data=data
        )
        if success and 'id' in response:
            self.journal_id = response['id']
            print(f"Created journal entry with ID: {self.journal_id}")
        return success

    def test_get_journal(self):
        """Test getting journal entries"""
        success, response = self.run_test(
            "Get Journal Entries",
            "GET",
            "api/journal",
            200
        )
        if success:
            print(f"Retrieved {len(response)} journal entries")
        return success

    def test_delete_income(self):
        """Test deleting income"""
        if not self.income_id:
            print("❌ No income ID to delete")
            return False
        
        success, _ = self.run_test(
            f"Delete Income (ID: {self.income_id})",
            "DELETE",
            f"api/income/{self.income_id}",
            200
        )
        return success

    def test_delete_expense(self):
        """Test deleting expense"""
        if not self.expense_id:
            print("❌ No expense ID to delete")
            return False
        
        success, _ = self.run_test(
            f"Delete Expense (ID: {self.expense_id})",
            "DELETE",
            f"api/expenses/{self.expense_id}",
            200
        )
        return success

    def test_delete_journal(self):
        """Test deleting journal entry"""
        if not self.journal_id:
            print("❌ No journal ID to delete")
            return False
        
        success, _ = self.run_test(
            f"Delete Journal Entry (ID: {self.journal_id})",
            "DELETE",
            f"api/journal/{self.journal_id}",
            200
        )
        return success

    def run_all_tests(self):
        """Run all tests in sequence"""
        print(f"🚀 Starting Financial Roadmap API Tests against {self.base_url}")
        
        # Basic endpoints
        self.test_health_check()
        self.test_dashboard()
        self.test_get_milestones()
        
        # Income tests
        self.test_add_income(1000, "trading", "Test trading income")
        self.test_add_income(500, "freelancing", "Test freelancing income")
        self.test_get_income()
        
        # Expense tests
        self.test_add_expense(100, "wifi", "Test wifi expense")
        self.test_add_expense(50, "gym", "Test gym expense")
        self.test_get_expenses()
        
        # Journal tests
        self.test_add_journal("Progress Update", "Making good progress on my savings!", "positive")
        self.test_get_journal()
        
        # Check dashboard again to verify progress calculation
        self.test_dashboard()
        
        # Cleanup
        self.test_delete_income()
        self.test_delete_expense()
        self.test_delete_journal()
        
        # Print results
        print(f"\n📊 Tests passed: {self.tests_passed}/{self.tests_run} ({(self.tests_passed/self.tests_run)*100:.1f}%)")
        return self.tests_passed == self.tests_run

if __name__ == "__main__":
    # Get the backend URL from the frontend .env file
    import os
    
    # Use the REACT_APP_BACKEND_URL from the frontend .env file
    backend_url = "https://880888f9-54ae-46e6-87ba-26f14e07daef.preview.emergentagent.com"
    
    tester = FinancialRoadmapTester(backend_url)
    success = tester.run_all_tests()
    
    sys.exit(0 if success else 1)