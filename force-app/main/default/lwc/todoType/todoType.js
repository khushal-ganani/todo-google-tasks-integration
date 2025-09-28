import { LightningElement, api } from 'lwc';

export default class CustomCellTodoType extends LightningElement {
    label;
    iconName;

    @api
    get value(){
        return this.label;
    }

    set value(value){
        this.label = value;
        this.iconName = this.getIconName(value);
    }

    getIconName(value) {
        const type = value;
        // different icons for To-Do cards with following types: Personal, Work, Academic, Health, Social, Household,
        // Hobbies, Self-Improvement, Other.
        switch (type) {
            case "Personal":
                return "utility:socialshare";
            case "Work":
                return "utility:company";
            case "Academic":
                return "utility:knowledge_base";
            case "Health":
                return "utility:center_align";
            case "Social":
                return "utility:groups";
            case "Household":
                return "utility:home";
            case "Hobbies":
                return "utility:brush";
            case "Self-Improvement":
                return "utility:trending";
            case "Other":
                return "utility:task";
            
            default:
                console.warn('Unexpected or undefined todo type:', type);
                return "utility:task"; // Default icon for unexpected types
        }
    }
}