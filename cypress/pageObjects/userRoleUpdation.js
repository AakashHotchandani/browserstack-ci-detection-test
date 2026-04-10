import APIEndpoints from "../../APIEndpoints"
import commandOptions from "../utils/constants/commandOptions"
import leverageConstants from "../utils/constants/Leverage/leverageConstants"
import userData from "../fixtures/userRoles/userCred.json"
import roledetails from "../fixtures/userRoles/bodyForEachRole.json"

export default class userRoleUpdation {
    static updateUserRole=(roleId)=>{
            cy.task("getAuthToken").then(authToken=>{
                cy.api({
                    url:`${Cypress.env("API_BaseUrl")}/${APIEndpoints.userRoleEndPoint(Cypress.env("SystemId"),Cypress.env("HospitalId"))}`,
                    failOnStatusCode:leverageConstants.failOnStatusCode,
                    method:commandOptions.requestMethod.put,
                    headers:{
                        authorization:authToken
                    },
                    body:{
                               "user": {
                                "name": userData.username,
                                "email": userData.email,
                                "username": userData.username,
                                "phone": null,
                                "metadata": {
                                    "department": {
                                        "id": null,
                                        "name": null
                                    },
                                    "notifications":roledetails["safetyViewer/SafetyTechnician"],
                                    "lastModified": Date.now()
                                }
                            },
                            "hospitalIds": [
                                Cypress.env("HospitalId")
                            ],
                            "roleId": roleId,
                            "departmentId": null,
                            "userId": Cypress.env("userRoleDeviceID"),
                            "deviceId": Cypress.env("HospitalId"),
                            "prevHospitalIds": [
                                Cypress.env("HospitalId")
                            ]
                    }
                    
                }).then(response=>{
                    // cy.log(JSON.stringify(response))
                    expect(response.status).to.equal(200)
                    expect(response.body).contain("User Details Updated Successfully")
                })
        
            })
    }
}