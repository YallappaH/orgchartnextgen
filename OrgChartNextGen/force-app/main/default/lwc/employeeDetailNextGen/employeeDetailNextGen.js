import { LightningElement, api } from 'lwc';

export default class EmployeeDetailNextGen extends LightningElement {
    @api employee;

    // Computed property to check if employee has direct reports
    get hasDirectReports() {
        return this.employee && 
               this.employee.directReportsCount && 
               this.employee.directReportsCount > 0;
    }

    // Returns an object containing statistics about direct reports with pending training.
    get pendingTrainingStats() {
        if (!this.employee || !this.employee.subordinates || this.employee.subordinates.length === 0) {
            return { pendingEmployees: [], totalTrainings: 0 };
        }
        let pendingEmployees = [];
        let totalTrainings = 0;
        // Loop through direct reports
        this.employee.subordinates.forEach(sub => {
            if (sub.hasPendingTraining) {
                let pendingCount = sub.parsedCourses ? sub.parsedCourses.length : 0;
                totalTrainings += pendingCount;
                pendingEmployees.push({
                    name: sub.fullName,
                    count: pendingCount
                });
            }
        });
        return { pendingEmployees, totalTrainings };
    }
}