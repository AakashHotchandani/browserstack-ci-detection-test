import LoginPage from "../../../pageObjects/signIn/siginPage";
import userRoleUpdation from "../../../pageObjects/userRoleUpdation"
import userData from "../../../fixtures/userRoles/userCred.json"
import globalSels from "../../../utils/selectors/globalSels";
import { Verify } from "../../../utils/assertions";
import HelperFunction from "../../../utils/helpers/crossModuleFunctions";
import Click from "../../../utils/Interactions/click";
import applicationAccessBasedOnRole from "../../../pageObjects/applicationAccessBasedOnRole";
import roleDetails from "../../../fixtures/userRoles/bodyForEachRole.json"
let userROle=roleDetails.roleID.SafetyTechnician
describe("updatating Role through API Request",function(){
   
   before("API Request to update the role",function(){
      userRoleUpdation.updateUserRole(userROle);
    
    })
   beforeEach("Login to Application",function(){
      HelperFunction.globalIntercept()
      LoginPage.toVisit("/");
      LoginPage.doUserLogin(userData.email,userData.password);
      Verify.elementContainingText(globalSels.profileSection.userProfileBtn).hasText(userData.username);
   })
    
   

    it("Checking the Applications to be accessed by Safety Viewer",function(){
      HelperFunction.globalIntercept()
        Click.on(globalSels.applicationMenuBtn)
        applicationAccessBasedOnRole.checkingApplications(userROle)
    })

   it("Checking the Modules accessed by Safety Viewer in Safety Application",function(){
      //  Object.values(user)
      HelperFunction.globalIntercept()
      applicationAccessBasedOnRole.checkingModulesinApplication(userROle)
   })
})


