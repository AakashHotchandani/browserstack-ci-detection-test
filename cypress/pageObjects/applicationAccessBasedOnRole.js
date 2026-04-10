import globalSels from "../utils/selectors/globalSels"
import userRole from "../fixtures/userRoles/userRole.json"
import prosightSafety from "../utils/selectors/prosightSafety";
export default class applicationAccessBasedOnRole{

    static checkingApplications(roleID){
        if(roleID===183||roleID===186){
            cy.get(globalSels.applicationAccess).find(globalSels.applicationMenuItem).its("length").should("equal",2);
            cy.get(globalSels.applicationAccess).within(()=>{
                cy.get(globalSels.applicationMenuItem).contains("Safety");
                cy.get(globalSels.applicationMenuItem).contains("Compliance")
            })
        }
    }
    static checkingModulesinApplication(roleID){
       if(roleID===183||roleID===186){
        cy.get(prosightSafety.sidePane).find(globalSels.accountSettings.sideNavButton)
        .its("length").should("equal",Object.values(userRole.Safety.safetyViewer).length)
        cy.get(prosightSafety.sidePane).first().within(()=>{
            Object.values(userRole.Safety.safetyViewer).forEach(module=>{
                cy.get(globalSels.accountSettings.sideNavButton).should("contain",module)
            })
        })
       }
    }
}