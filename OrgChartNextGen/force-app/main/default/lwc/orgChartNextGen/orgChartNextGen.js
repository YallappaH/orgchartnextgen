import { LightningElement, track, wire } from 'lwc';
import getEmployeeOrgData from '@salesforce/apex/OrgChartControllerNextGen.getEmployeeOrgData';

export default class OrgChartNextGen extends LightningElement {
    @track treeData;
    fullTree = [];
    rawData = [];

    // Filter states
    @track selectedDepartment = '';
    @track contractorFilter = false;
    @track pendingTrainingFilter = false;
    @track selectedCourse = '';

    // Dropdown options
    @track departmentOptions = [];
    @track trainingOptions = [];

    // Side-panel detail
    @track selectedEmployee;
    @track showDetail = false;

    @wire(getEmployeeOrgData)
    wiredEmployees({ error, data }) {
        if (data) {
            let trainingMap = {};
            this.rawData = data.map(emp => {
                // Create a new object instead of modifying the existing one
                let empCopy = { ...emp };
                
                // Set department for top-level employees if missing
                if (empCopy.email === 'oansari@salesforce.com' && !empCopy.department) {
                    empCopy.department = 'Indirect Labor';
                }
                
                let parsedCourses = [];
                if (empCopy.hasPendingTraining && empCopy.pendingCourses) {
                    parsedCourses = this.parsePendingCourses(empCopy.pendingCourses);
                    parsedCourses.forEach(course => {
                        if (course.courseName && course.dueDate) {
                            const due = new Date(course.dueDate);
                            if (isNaN(due.getTime())) {
                                return;
                            }
                            let courseKey = course.courseName.trim().toLowerCase();
                            if (!trainingMap[courseKey] || due < trainingMap[courseKey]) {
                                trainingMap[courseKey] = due;
                            }
                        }
                    });
                }
                return { ...empCopy, parsedCourses };
            });

            // Build Department Options.
            const deptSet = new Set(this.rawData.map(e => e.department ? e.department.trim() : ''));
            this.departmentOptions = [
                { label: 'All Departments', value: '' },
                ...Array.from(deptSet).filter(d => d !== '').map(d => ({ label: d, value: d }))
            ];

            // Build Training Options.
            this.trainingOptions = [{ label: 'All Courses', value: '' }];
            Object.keys(trainingMap).forEach(courseKey => {
                let due = trainingMap[courseKey];
                if (isNaN(due.getTime())) { return; }
                let dateStr = due.toISOString().split('T')[0];
                let label = courseKey.charAt(0).toUpperCase() + courseKey.slice(1) + ' - ' + dateStr;
                this.trainingOptions.push({ label, value: courseKey });
            });
            // Sort training options (except "All Courses") by due date
            let first = this.trainingOptions[0];
            let rest = this.trainingOptions.slice(1).sort((a, b) => {
                let dA = new Date(a.label.split(' - ')[1]);
                let dB = new Date(b.label.split(' - ')[1]);
                return dA - dB;
            });
            this.trainingOptions = [first, ...rest];

            // Build the full tree, preserving the original rawData order
            this.buildFullTree();
            // Compute direct reports count recursively
            this.fullTree.forEach(node => this.computeDirectReportsCount(node));
            this.applyFilters();
        } else if (error) {
            console.error('Error retrieving employee org data', error);
        }
    }

    /** 
     * Parse the pendingCourses string. Expected format:
     * "CourseName1 - DueDate1; CourseName2 - DueDate2; ..."
     * Skips invalid due dates.
     */
    parsePendingCourses(pendingStr) {
        if (!pendingStr || pendingStr.trim() === '') return [];
        let items = pendingStr.split(';');
        let courses = [];
        for (let item of items) {
            item = item.trim();
            if (!item) continue;
            let [courseName, dueDate] = item.split(' - ');
            courseName = courseName ? courseName.trim() : '';
            dueDate = dueDate ? dueDate.trim() : '';
            if (!courseName) continue;
            let d = new Date(dueDate);
            if (dueDate && isNaN(d.getTime())) {
                console.warn(`Skipping invalid due date for course ${courseName}: ${dueDate}`);
                continue;
            }
            const { cssClass, emoji } = this.computeTrainingDisplay(dueDate);
            courses.push({ courseName, dueDate, cssClass, emoji });
        }
        return courses;
    }

    /**
     * Compute CSS class and emoji based on due date.
     * If due date is missing/invalid => grey.
     * If due in <= 3 days or overdue: red (😱).
     * Otherwise: yellow (⚠️).
     */
    computeTrainingDisplay(dueDate) {
        if (!dueDate || dueDate.trim() === '') return { cssClass: 'training-grey', emoji: '' };
        const due = new Date(dueDate);
        if (isNaN(due.getTime())) return { cssClass: 'training-grey', emoji: '' };
        const today = new Date();
        const diffTime = due.getTime() - today.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        if (diffDays <= 0 || diffDays <= 3) {
            return { cssClass: 'training-red', emoji: '😱' };
        } else {
            return { cssClass: 'training-yellow', emoji: '⚠️' };
        }
    }

    /**
     * Build the full tree from rawData while preserving the original order.
     */
    buildFullTree() {
        let nodeMap = {};
        this.rawData.forEach(emp => {
            // Add department color property for background colors
            let deptColor = '';
            if (emp.department) {
                const deptLower = emp.department.trim().toLowerCase();
                // Enhanced logging to debug department assignments
                console.log(`Processing employee ${emp.email} with department: '${emp.department}'`);
                
                switch(deptLower) {
                    case 'viz': 
                        deptColor = 'dept-viz'; 
                        break;
                    case 'indirect labor': 
                        deptColor = 'dept-indirect'; 
                        break;
                    case 'edh': 
                        deptColor = 'dept-edh'; 
                        break;
                    case 'data cloud': 
                        deptColor = 'dept-datacloud'; 
                        console.log(`Assigned dept-datacloud to ${emp.email}`);
                        break;
                    case 'snowflake': 
                        deptColor = 'dept-snowflake'; 
                        console.log(`Assigned dept-snowflake to ${emp.email}`);
                        break;
                    default: 
                        deptColor = 'dept-default';
                        console.log(`Unknown department '${emp.department}', assigned default color`);
                }
            }
            nodeMap[emp.email] = { ...emp, subordinates: [], deptColor };
        });
        let roots = [];
        this.rawData.forEach(emp => {
            let node = nodeMap[emp.email];
            if (emp.managerEmail && nodeMap[emp.managerEmail]) {
                nodeMap[emp.managerEmail].subordinates.push(node);
            } else {
                roots.push(node);
            }
        });
        
        // Sort subordinates alphabetically by fullName for all nodes
        const sortSubordinates = (node) => {
            if (node.subordinates && node.subordinates.length > 0) {
                // Sort this node's subordinates
                node.subordinates.sort((a, b) => {
                    return a.fullName.localeCompare(b.fullName);
                });
                
                // Recursively sort each subordinate's subordinates
                node.subordinates.forEach(sortSubordinates);
            }
        };
        
        // Apply sorting to all root nodes
        roots.forEach(sortSubordinates);
        
        this.fullTree = roots;
        console.log('Full Tree built:', JSON.stringify(this.fullTree, null, 2));
    }

    /**
     * Recursively compute direct reports count and store in node.
     */
    computeDirectReportsCount(node) {
        if (!node) return 0;
        let count = node.subordinates ? node.subordinates.length : 0;
        if (node.subordinates && node.subordinates.length > 0) {
            node.subordinates.forEach(child => {
                count += this.computeDirectReportsCount(child);
            });
        }
        node.directReportsCount = node.subordinates ? node.subordinates.length : 0;
        return count;
    }

    /**
     * Apply filters by deep-cloning the full tree and pruning nodes that do not match.
     */
    applyFilters() {
        console.log('Applying filters:', {
            selectedDepartment: this.selectedDepartment,
            contractorFilter: this.contractorFilter,
            pendingTrainingFilter: this.pendingTrainingFilter,
            selectedCourse: this.selectedCourse
        });
        // If no filters are active, use fullTree.
        if (!this.selectedDepartment && !this.contractorFilter && !this.pendingTrainingFilter && !this.selectedCourse) {
            console.log('No filters active; using full tree.');
            this.treeData = this.fullTree;
            return;
        }
        let clonedRoots = this.fullTree.map(root => this.cloneNode(root));
        clonedRoots = clonedRoots.filter(r => this.pruneNode(r));
        console.log('Filtered tree:', JSON.stringify(clonedRoots, null, 2));
        this.treeData = clonedRoots.length ? clonedRoots : null;
    }

    /**
     * Recursively clone a node.
     */
    cloneNode(orig) {
        return {
            ...orig,
            subordinates: (orig.subordinates || []).map(child => this.cloneNode(child))
        };
    }

    /**
     * Recursively prune nodes that do not pass the filters.
     * This version preserves paths to nodes that match the filter criteria.
     */
    pruneNode(node) {
        // Check if this node matches all filters
        const nodeMatches = this.nodePassesFilters(node);
        
        // Filter subordinates, keeping those that pass recursively
        if (node.subordinates && node.subordinates.length > 0) {
            // Process subordinates
            let hasMatchingSubordinate = false;
            const filteredSubs = [];
            
            for (let child of node.subordinates) {
                // Recursively check if this subtree should be kept
                const keepChild = this.pruneNode(child);
                if (keepChild) {
                    filteredSubs.push(child);
                    hasMatchingSubordinate = true;
                }
            }
            
            // Update subordinates with filtered list
            node.subordinates = filteredSubs;
            
            // If node itself matches OR it has matching subordinates, keep it
            return nodeMatches || hasMatchingSubordinate;
        }
        
        // No subordinates, just check if this node matches
        return nodeMatches;
    }

    /**
     * Check if a node passes the current filters.
     * Department and training course are compared case-insensitively.
     */
    nodePassesFilters(node) {
        let passesDept = true;
        if (this.selectedDepartment) {
            const nodeDept = node.department ? node.department.trim().toLowerCase() : '';
            const selectedDept = this.selectedDepartment.trim().toLowerCase();
            passesDept = nodeDept === selectedDept;
            
            // Enhanced debugging for department filtering
            console.log(`Department comparison for ${node.email}:`, {
                nodeDepartment: node.department,
                nodeDeptTrimmedLower: nodeDept,
                selectedDeptTrimmedLower: selectedDept,
                matches: passesDept
            });
        }
        
        let passesFTE = true;
        if (this.contractorFilter) {
            passesFTE = (node.isFTE && (node.isFTE.toString().trim().toLowerCase() === 'fte' || node.isFTE.toString().trim().toLowerCase() === 'true'));
        }
        
        let passesTrainingFlag = true;
        if (this.pendingTrainingFilter) {
            passesTrainingFlag = (node.hasPendingTraining === true);
        }
        
        let passesCourse = true;
        if (this.selectedCourse) {
            passesCourse = node.parsedCourses && node.parsedCourses.some(c => c.courseName && c.courseName.trim().toLowerCase() === this.selectedCourse.trim().toLowerCase());
        }
        
        const passes = passesDept && passesFTE && passesTrainingFlag && passesCourse;
        console.log(`Node ${node.email} passes filters:`, { passesDept, passesFTE, passesTrainingFlag, passesCourse, passes });
        return passes;
    }

    // Event handlers
    toggleContractors() {
        this.contractorFilter = !this.contractorFilter;
        this.applyFilters();
    }
    togglePendingTraining() {
        this.pendingTrainingFilter = !this.pendingTrainingFilter;
        this.applyFilters();
    }
    handleDepartmentChange(event) {
        console.log('Department changed:', event.detail.value);
        this.selectedDepartment = event.detail.value;
        this.applyFilters();
    }
    
    handleTrainingChange(event) {
        console.log('Training changed:', event.detail.value);
        this.selectedCourse = event.detail.value;
        this.applyFilters();
    }
    handleEmployeeClick(event) {
        this.selectedEmployee = event.detail;
        this.showDetail = true;
    }

    // Button label getters
    get contractorButtonLabel() {
        return this.contractorFilter ? 'Show Contractors' : 'Hide Contractors';
    }
    get pendingTrainingButtonLabel() {
        return this.pendingTrainingFilter ? 'Remove Filter' : 'Pending Training';
    }

    // Pending training count computed from rawData
    get pendingTrainingCount() {
        return this.rawData.filter(emp => emp.hasPendingTraining === true).length;
    }
    
    // // Combines label with badge count for pending training button
    // get pendingTrainingButtonLabelWithCount() {
    //     return `${this.pendingTrainingFilter ? 'Show All Training' : 'Pending Training'} (${this.pendingTrainingCount})`;
    // }

    // Use a simpler version without the count:
    get pendingTrainingButtonLabel() {
        return this.pendingTrainingFilter ? 'Show All Training' : 'Pending Training';
    }

    get totalEmployees() {
        return this.rawData.length;
    }
    
    get totalContractors() {
        return this.rawData.filter(emp => {
            let val = emp.isFTE ? emp.isFTE.toString().trim().toLowerCase() : '';
            // If not 'fte' or 'true', treat as contractor
            return val !== 'fte' && val !== 'true';
        }).length;
    }
    
    get totalTrainingsPending() {
        return this.rawData.reduce((acc, emp) => {
            if (emp.hasPendingTraining && emp.parsedCourses) {
                return acc + emp.parsedCourses.length;
            }
            return acc;
        }, 0);
    }
    
    get trainingDueStats() {
        let statMap = {};
        this.rawData.forEach(emp => {
            if (emp.hasPendingTraining && emp.parsedCourses) {
                emp.parsedCourses.forEach(course => {
                    const courseName = course.courseName || 'UnknownCourse';
                    const dd = course.dueDate || 'No Date';
                    const key = `${courseName}||${dd}`;
                    if (!statMap[key]) {
                        statMap[key] = 0;
                    }
                    statMap[key]++;
                });
            }
        });
        let arr = [];
        Object.keys(statMap).forEach(k => {
            const [courseName, dd] = k.split('||');
            let dueLabel = `${courseName} (${dd})`;
            const courseNameLower = courseName.trim().toLowerCase();
            arr.push({
                dueLabel,
                dueDate: dd,
                courseName: courseNameLower,
                count: statMap[k],
                selected: this.selectedCourse === courseNameLower
            });
        });
        arr.sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));
        return arr;
    }
    
    // Handle legend item click for department filtering
    handleLegendClick(event) {
        // Get the department value from the clicked legend item
        const department = event.currentTarget.dataset.department;
        console.log('Legend clicked for department:', department);
        
        // Debug all departments in the data
        console.log('Available departments in data:');
        const allDepts = new Set();
        this.rawData.forEach(emp => {
            if (emp.department) {
                allDepts.add(emp.department.trim());
                console.log(`Employee ${emp.email} has department: '${emp.department.trim()}'`);
            } else {
                console.log(`Employee ${emp.email} has NO department`);
            }
        });
        console.log('Unique departments:', Array.from(allDepts));
        
        // Update the selected department
        this.selectedDepartment = department;
        
        // Reset any course selection when department changes
        this.selectedCourse = '';
        
        // Apply filters
        this.applyFilters();
    }
    
    // Handle training item click for course filtering
    handleTrainingClick(event) {
        // Get the course value from the clicked item
        const course = event.currentTarget.dataset.course;
        console.log('Training clicked for course:', course);
        
        // Update the selected course
        this.selectedCourse = course;
        
        // Apply filters
        this.applyFilters();
    }
    
    // Computed properties for legend active indicators
    get isVizSelected() {
        return this.selectedDepartment === 'Viz';
    }
    
    get isIndirectSelected() {
        return this.selectedDepartment === 'Indirect Labor';
    }
    
    get isEDHSelected() {
        return this.selectedDepartment === 'EDH';
    }
    
    get isDataCloudSelected() {
        return this.selectedDepartment === 'Data Cloud';
    }
    
    get isSnowflakeSelected() {
        return this.selectedDepartment === 'Snowflake';
    }
    
    isCourseSelected(courseName) {
        return this.selectedCourse && this.selectedCourse.trim().toLowerCase() === courseName.trim().toLowerCase();
    }
}