public with sharing class OrgChartControllerNextGen {
    
    @AuraEnabled(cacheable=true)
    public static List<OrgEmployee> getEmployeeOrgData() {
        List<OrgEmployee> results = new List<OrgEmployee>();
        
        try {
            String soql = 'SELECT department__c, email__c, full_name__c, ' +
                          'has_pending_training__c, is_fte__c, manager_email__c, ' +
                          'manager_name__c, pending_courses_with_due_date__c, ' +
                          'profile_image_link__c, title__c ' +
                          'FROM Int_SNOW_NextGen_SV_EMPLOYEE_ORG_HIERARC__dlm';
            
            List<SObject> records = Database.query(soql);
            
            // Check if we actually got records back
            if (records.isEmpty()) {
                System.debug('No records found. Using sample data.');
                return getSampleData();
            }
            
            for(SObject rec : records) {
                // Use String.valueOf to safely convert the value (which might be Boolean) into a string.
                String trainingFlag = String.valueOf(rec.get('has_pending_training__c'));
                Boolean hasTraining = (trainingFlag != null && trainingFlag.toLowerCase() == 'true');
                
                OrgEmployee emp = new OrgEmployee(
                    String.valueOf(rec.get('department__c')),
                    String.valueOf(rec.get('email__c')),
                    String.valueOf(rec.get('full_name__c')),
                    hasTraining,
                    String.valueOf(rec.get('is_fte__c')),
                    String.valueOf(rec.get('manager_email__c')),
                    String.valueOf(rec.get('manager_name__c')),
                    String.valueOf(rec.get('pending_courses_with_due_date__c')),
                    String.valueOf(rec.get('profile_image_link__c')),
                    String.valueOf(rec.get('title__c'))
                );
                results.add(emp);
            }
        } catch(Exception e) {
            System.debug('Error querying employee data. Using sample data instead. Error: ' + e.getMessage());
            // If real data not available, use sample data
            results = getSampleData();
        }
        
        return results;
    }
    
    /**
     * Provides sample employee data when the actual data source is unavailable
     */
    private static List<OrgEmployee> getSampleData() {
        List<OrgEmployee> employees = new List<OrgEmployee>();
        
        // CEO
        employees.add(new OrgEmployee(
            'Indirect Labor',
            'oansari@salesforce.com',
            'Omer Ansari',
            true,
            'FTE',
            'echidambaram@salesforce.com',
            'Eshwari Chidambaram',
            'FY26 BT Incident Response Course - 2025-04-30; Non-Customer-Facing Roles: FY26 Q1 Corporate Message Certification - 2025-05-23',
            'https://avatars.slack-edge.com/2023-10-09/6010666170389_d673a792146c918c66eb_512.jpg',
            'Senior Director, Product Line Manager'
        ));
        
        // VP Level
        employees.add(new OrgEmployee(
            'Indirect Labor',
            'mkallem@salesforce.com',
            'Murali Kallem',
            true,
            'FTE',
            'oansari@salesforce.com',
            'Omer Ansari',
            'Non-Customer-Facing Roles: FY26 Q1 Corporate Message Certification - 2025-05-23',
            'https://avatars.slack-edge.com/2020-12-09/1575292918049_bb3e0b5fe823017b725f_512.jpg',
            'Director, Engineering Manager - Software'
        ));
        
        employees.add(new OrgEmployee(
            'Viz',
            'rahulev@salesforce.com',
            'Rahul EV',
            true,
            'FTE',
            'oansari@salesforce.com',
            'Omer Ansari',
            'March 2025 BT Trust Stand Down - 2025-04-30',
            'https://avatars.slack-edge.com/2023-05-25/5319363498322_93f040c23d1bf6080eb8_512.jpg',
            'SVP, Engineering'
        ));
        
        employees.add(new OrgEmployee(
            'Indirect Labor',
            'uvadlamudi@salesforce.com',
            'Uday Vadlamudi',
            true,
            'FTE',
            'oansari@salesforce.com',
            'Omer Ansari',
            'March 2025 BT Trust Stand Down - 2025-04-30; FY26 BT Incident Response Course - 2025-04-30',
            'https://avatars.slack-edge.com/2023-01-09/4560413783238_f09f71b6f457124e108a_512.jpg',
            'Senior Manager, Software Engineering'
        ));
        
        employees.add(new OrgEmployee(
            'Indirect Labor',
            'yhuchchannavar@salesforce.com',
            'Yallappa H',
            true,
            'FTE',
            'oansari@salesforce.com',
            'Omer Ansari',
            'Non-Customer-Facing Roles: FY26 Q1 Corporate Message Certification - 2025-05-23',
            'https://avatars.slack-edge.com/2022-03-31/3320720781780_94fbe3a45e1d4b2ca1d1_512.jpg',
            'Senior Lead, Data Engineer'
        ));
        
        // Directors under Murali
        employees.add(new OrgEmployee(
            'Indirect Labor',
            'knagarajan@salesforce.com',
            'Krishnan Nagarajan',
            true,
            'FTE',
            'mkallem@salesforce.com',
            'Murali Kallem',
            'March 2025 BT Trust Stand Down - 2025-04-30; FY26 BT Incident Response Course - 2025-04-30; Non-Customer-Facing Roles: FY26 Q1 Corporate Message Certification - 2025-05-23',
            'https://avatars.slack-edge.com/2024-12-10/8153001478483_f5e8b69c4f6a3797ae32_512.jpg',
            'Software Engineering LMTS'
        ));
        
        employees.add(new OrgEmployee(
            'Indirect Labor',
            'rajesh.yarlagadda@salesforce.com',
            'Rajesh Yarlagadda',
            true,
            'FTE',
            'mkallem@salesforce.com',
            'Murali Kallem',
            'March 2025 BT Trust Stand Down - 2025-04-30; Non-Customer-Facing Roles: FY26 Q1 Corporate Message Certification - 2025-05-23; FY26 BT Incident Response Course - 2025-04-30',
            'https://avatars.slack-edge.com/2024-08-21/7608886229621_2bee57ae3142f0671ebf_512.jpg',
            'Software Engineering LMTS'
        ));
        
        employees.add(new OrgEmployee(
            'Viz',
            'stalachiru@salesforce.com',
            'Subbarao Talachiru',
            true,
            'FTE',
            'mkallem@salesforce.com',
            'Murali Kallem',
            'FY26 BT Incident Response Course - 2025-04-30',
            'https://avatars.slack-edge.com/2024-01-08/6233213717232_6b12423a5b783acf1b4c_512.jpg',
            'Lead Architect'
        ));
        
        employees.add(new OrgEmployee(
            'Data Integration',
            'vsadiq@salesforce.com',
            'Venkat Sadiq',
            false,
            'Contractor',
            'mkallem@salesforce.com',
            'Murali Kallem',
            '',
            'https://avatars.slack-edge.com/2023-10-09/6010666170389_d673a792146c918c66eb_512.jpg',
            'Data Integration Specialist'
        ));
        
        // Team under Rahul
        employees.add(new OrgEmployee(
            'EDH',
            'bshah@salesforce.com',
            'Behzad Shah',
            true,
            'FTE',
            'rahulev@salesforce.com',
            'Rahul EV',
            'March 2025 BT Trust Stand Down - 2025-04-30',
            'https://avatars.slack-edge.com/2023-12-10/6152551278433_ab89fa1cd5c0351f1c89_512.jpg',
            'Engineering Manager'
        ));
        
        employees.add(new OrgEmployee(
            'EDH',
            'derek.chan@salesforce.com',
            'Derek Chan',
            true,
            'FTE',
            'rahulev@salesforce.com',
            'Rahul EV',
            'March 2025 BT Trust Stand Down - 2025-04-30',
            'https://avatars.slack-edge.com/2023-12-11/6149723568372_e32bc61c50d9fd1cb6f2_512.jpg',
            'Software Engineering SMTS'
        ));
        
        // Add Gaurav Tewari in Data Cloud department
        employees.add(new OrgEmployee(
            'Data Cloud',
            'gtewari@salesforce.com',
            'Gaurav Tewari',
            true,
            'FTE',
            'rahulev@salesforce.com',
            'Rahul EV',
            'March 2025 BT Trust Stand Down - 2025-04-30',
            'https://avatars.slack-edge.com/2023-12-11/6149723568372_e32bc61c50d9fd1cb6f2_512.jpg',
            'Data Cloud Engineer'
        ));
        
        employees.add(new OrgEmployee(
            'Indirect Labor',
            'vyee@salesforce.com',
            'Virginia Yee',
            true,
            'FTE',
            'oansari@salesforce.com',
            'Omer Ansari',
            'FY26 BT Incident Response Course - 2025-04-30; Non-Customer-Facing Roles: FY26 Q1 Corporate Message Certification - 2025-05-23',
            'https://avatars.slack-edge.com/2023-10-09/6010666170389_d673a792146c918c66eb_512.jpg',
            'Engineering Director'
        ));
        
        // Add Virginia's directs
        employees.add(new OrgEmployee(
            'Indirect Labor',
            'john.doe@salesforce.com',
            'John Doe',
            true,
            'FTE',
            'vyee@salesforce.com',
            'Virginia Yee',
            'March 2025 BT Trust Stand Down - 2025-04-30',
            'https://avatars.slack-edge.com/2023-12-11/6149723568372_e32bc61c50d9fd1cb6f2_512.jpg',
            'Software Engineer'
        ));
        
        employees.add(new OrgEmployee(
            'Indirect Labor',
            'jane.smith@salesforce.com',
            'Jane Smith',
            true,
            'FTE',
            'vyee@salesforce.com',
            'Virginia Yee',
            'March 2025 BT Trust Stand Down - 2025-04-30',
            'https://avatars.slack-edge.com/2023-12-10/6152551278433_ab89fa1cd5c0351f1c89_512.jpg',
            'Software Engineer'
        ));
        
        return employees;
    }
    
    // Wrapper class for employee data
    public class OrgEmployee {
        @AuraEnabled public String department;
        @AuraEnabled public String email;
        @AuraEnabled public String fullName;
        @AuraEnabled public Boolean hasPendingTraining;
        @AuraEnabled public String isFTE;
        @AuraEnabled public String managerEmail;
        @AuraEnabled public String managerName;
        @AuraEnabled public String pendingCourses; // Raw pending courses string
        @AuraEnabled public String profileImageLink;
        @AuraEnabled public String title;
        
        public OrgEmployee(String department, String email, String fullName, Boolean hasPendingTraining,
                           String isFTE, String managerEmail, String managerName, String pendingCourses,
                           String profileImageLink, String title) {
            this.department = department;
            this.email = email;
            this.fullName = fullName;
            this.hasPendingTraining = hasPendingTraining;
            this.isFTE = isFTE;
            this.managerEmail = managerEmail;
            this.managerName = managerName;
            this.pendingCourses = pendingCourses;
            this.profileImageLink = profileImageLink;
            this.title = title;
        }
    }
}