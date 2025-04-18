import { LightningElement, api, track } from 'lwc';

export default class OrgNodeNextGen extends LightningElement {
    @api treeItem;
    @api depth;
    @track collapsed = false;

    get hasSubordinates() {
        return this.treeItem?.subordinates?.length > 0;
    }

    // If you want to force vertical for a large subtree or for certain employees by name:
    get isVerticalLayout() {
        // Convert depth to a number
        const d = Number(this.depth);
        
        // 1) If the employee's name is one of these, forced vertical
        if (this.treeItem?.fullName?.includes('Rahul') || 
            this.treeItem?.fullName?.includes('Uday') ||
            this.treeItem?.fullName?.includes('Virginia')) {
            return true;
        }
        // 2) If depth <= 2 => horizontal, else vertical
        // Adjust logic as needed
        return d > 2;
    }

    get computedChildDepth() {
        return String(Number(this.depth) + 1);
    }

    handleNodeClick(event) {
        event.stopPropagation();
        
        // Get the template root and query for selected nodes across the org chart
        const root = this.template.querySelector('.org-node').getRootNode();
        const allSelectedNodes = root.querySelectorAll('.org-node.selected');
        
        // Remove selected class from all nodes
        allSelectedNodes.forEach(node => {
            node.classList.remove('selected');
        });
        
        // Add selected class to clicked node
        const clickedNode = event.currentTarget;
        clickedNode.classList.add('selected');
        
        this.dispatchEvent(new CustomEvent('employeeclick', {
            detail: this.treeItem,
            bubbles: true,
            composed: true // This allows the event to cross shadow DOM boundaries
        }));
    }

    handleChildClick(event) {
        event.stopPropagation();
        
        // Remove blue highlight from all SLDS elements
        const root = this.template.querySelector('.org-node').getRootNode();
        const focusedElements = root.querySelectorAll('.slds-has-focus');
        if (focusedElements) {
            focusedElements.forEach(element => {
                element.classList.remove('slds-has-focus');
                element.blur();
            });
        }
        
        this.dispatchEvent(new CustomEvent('employeeclick', {
            detail: event.detail,
            bubbles: true,
            composed: true
        }));
    }

    get nodeStyle() {
        // More compact style with minimal borders
        const selectedClass = this.template.querySelector('.org-node.selected') ? 'selected' : '';
        // Remove the border that's causing the blue highlight
        return 'padding: 0.3rem; margin: 0.2rem; border: none; background-color: #fff; text-align: center; border-radius: 4px;';
    }

    // Add to orgNodeNextGen.js
    renderedCallback() {
        // Apply appropriate CSS classes based on employee type and department
        if (this.treeItem) {
            const nodeElement = this.template.querySelector('.org-node');
            const nodeContainer = this.template.querySelector('.node-container');
            
            // Remove any SLDS focus styling
            nodeElement.classList.remove('slds-has-focus');
            nodeElement.tabIndex = '-1'; // Make it non-focusable
            
            // Add contractor class if not FTE
            if (this.treeItem.isFTE && 
                (this.treeItem.isFTE.toString().trim().toLowerCase() !== 'fte' && 
                this.treeItem.isFTE.toString().trim().toLowerCase() !== 'true')) {
                nodeElement.classList.add('contractor-node');
            }
            
            // Add manager class if has subordinates
            if (this.treeItem.subordinates && this.treeItem.subordinates.length > 0) {
                nodeElement.classList.add('manager-node');
                
                // Add special class for certain managers to fix connector lines
                if (this.treeItem.email === 'mkallem@salesforce.com' || 
                    this.treeItem.email === 'yhuchchannavar@salesforce.com' ||
                    this.treeItem.fullName.includes('Virginia')) {
                    nodeContainer.classList.add('manager-horizontal-connector');
                }
            }
            
            // Add department class
            if (this.treeItem.department) {
                const deptLower = this.treeItem.department.trim().toLowerCase();
                switch(deptLower) {
                    case 'viz': 
                        nodeElement.classList.add('dept-viz'); 
                        break;
                    case 'indirect labor': 
                        nodeElement.classList.add('dept-indirect'); 
                        break;
                    case 'engineering': 
                        nodeElement.classList.add('dept-engineering'); 
                        break;
                    case 'marketing': 
                        nodeElement.classList.add('dept-marketing'); 
                        break;
                    case 'edh': 
                        nodeElement.classList.add('dept-edh'); 
                        break;
                    case 'snowflake': 
                        nodeElement.classList.add('dept-snowflake'); 
                        break;
                    case 'data tools':
                    case 'data':
                        nodeElement.classList.add('dept-data'); 
                        break;
                    case 'data cloud':
                        nodeElement.classList.add('dept-datacloud'); 
                        console.log(`Assigned dept-datacloud to ${this.treeItem.email}`);
                        break;
                    default: 
                        nodeElement.classList.add('dept-default');
                }
            }
            
            // Remove blue highlight from any focused element
            const root = nodeElement.getRootNode();
            const focusedElements = root.querySelectorAll('.slds-has-focus');
            if (focusedElements) {
                focusedElements.forEach(element => {
                    element.classList.remove('slds-has-focus');
                    element.blur();
                });
            }
        }
    }
}