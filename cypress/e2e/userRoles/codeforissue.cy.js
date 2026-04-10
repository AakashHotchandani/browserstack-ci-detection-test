import HelperFunction from "../../utils/helpers/crossModuleFunctions"
describe("code for issues",()=>{
    beforeEach(()=>{
        HelperFunction.globalIntercept();
    })
    it("visit",()=>{
        cy.visit("https://dev-prosight--smarthosp-10022-10023-2-it6kq15z.web.app/environment/p/prosightAdministrator/smartReports/hospital/6ajkDogbN2CoFdJST3F6AD/reports/create?f=eyJ0eXBlIjoibW9sdGVuLkZpbHRlclNvdXJjZU1vZGVsIiwiYWN0aXZlIjp0cnVlLCJwcmlvcml0eSI6MSwiZsUvIjpudWxsLCJzb3J0yAxtZXRhZGF0YcgQYmFzaWPGXnMiOnsiZGF0ZVJhbmdlxA1uYW3kAITKFCwidmFsdWUiOlvJHWxhc3Q3RGF5c8odyxR9XSwicGVyc2lzdCI6ZmFsc2UsInNlbGVjdG9yVOYA4sReIssWaXRsxBdEYXRlIMh2yB1JY29uIjoiY2ggY2gtY2FsZW5kYXLLIE9wdHMiOltdLCJ2aXNpYsRJxXV9LCJkZXBhcnRtZW507ADayhXzANswWjJuYTl1MHFOeGRidUdJZFR4Z0RiyirYIf0A9egA38x69QDf7QCc%2FwDh5ADhaXRlbeYBU%2BkCPesB3SIs6ADWySjqAPL%2FALBl6QJJ7QCozhTmAJrGFO8AnH19&page=0&reportType=environment.smartReports.environmental")
        cy.get('.lev-textInput').type("jahnavi.b@codecraft.co.in")
        cy.get('.lev-sc-input').type("Prosight123")
        cy.get('.login_dN2jV').click();
        cy.contains('Select Assigned Owner').click({force:true});
        cy.get('.lev-sc-input').type("9th West12")
        cy.get("span").contains("9th West12").click()
        cy.contains('Select Equipment Type').click({force:true});
        cy.get('.lev-sc-input').type("123qsdasdaqq")
        cy.get("span").contains("123qsdasdaqq").click()
        cy.contains('123qsdasdaqq').click({force:true});
        cy.get('.lev-sc-input').type("Vaccine")
       cy.get("span").contains("123qsdasdaqq").click()
        cy.contains("Select Equipment Name").click();
        cy.get("div[class*='checkboxButton_W1oCJ']").each(ele=>{
            console.log(ele.text())
        })
    })

    it("selecting all equipment types of depo",()=>{
        cy.visit("https://dev-prosight--smarthosp-10022-10023-2-it6kq15z.web.app/environment/p/prosightAdministrator/smartReports/hospital/6ajkDogbN2CoFdJST3F6AD/reports/create?f=eyJ0eXBlIjoibW9sdGVuLkZpbHRlclNvdXJjZU1vZGVsIiwiYWN0aXZlIjp0cnVlLCJwcmlvcml0eSI6MSwiZsUvIjpudWxsLCJzb3J0yAxtZXRhZGF0YcgQYmFzaWPGXnMiOnsiZGF0ZVJhbmdlxA1uYW3kAITKFCwidmFsdWUiOlvJHWxhc3Q3RGF5c8odyxR9XSwicGVyc2lzdCI6ZmFsc2UsInNlbGVjdG9yVOYA4sReIssWaXRsxBdEYXRlIMh2yB1JY29uIjoiY2ggY2gtY2FsZW5kYXLLIE9wdHMiOltdLCJ2aXNpYsRJxXV9LCJkZXBhcnRtZW507ADayhXzANswWjJuYTl1MHFOeGRidUdJZFR4Z0RiyirYIf0A9egA38x69QDf7QCc%2FwDh5ADhaXRlbeYBU%2BkCPesB3SIs6ADWySjqAPL%2FALBl6QJJ7QCozhTmAJrGFO8AnH19&page=0&reportType=environment.smartReports.environmental")
        cy.get('.lev-textInput').type("jahnavi.b@codecraft.co.in")
        cy.get('.lev-sc-input').type("Prosight123")
        cy.get('.login_dN2jV').click();
        cy.contains('Select Assigned Owner').click({force:true});
        cy.get('.lev-sc-input').type("9th Floor Main Tower12367890")
        cy.get("span").contains("9th Floor Main Tower12367890").click()
        cy.contains('Select Equipment Type').click({force:true});
        cy.contains("Select All").prev().click();
        cy.contains("Select Equipment Name").click();
        cy.get("div[class*='checkboxButton_W1oCJ']").each(ele=>{
            console.log(ele.text())
        })

    })

    it.only("Selecting Multiple Departments",()=>{
        cy.visit("https://dev-prosight--smarthosp-10022-10023-2-it6kq15z.web.app/environment/p/prosightAdministrator/smartReports/hospital/6ajkDogbN2CoFdJST3F6AD/reports/create?f=eyJ0eXBlIjoibW9sdGVuLkZpbHRlclNvdXJjZU1vZGVsIiwiYWN0aXZlIjp0cnVlLCJwcmlvcml0eSI6MSwiZsUvIjpudWxsLCJzb3J0yAxtZXRhZGF0YcgQYmFzaWPGXnMiOnsiZGF0ZVJhbmdlxA1uYW3kAITKFCwidmFsdWUiOlvJHWxhc3Q3RGF5c8odyxR9XSwicGVyc2lzdCI6ZmFsc2UsInNlbGVjdG9yVOYA4sReIssWaXRsxBdEYXRlIMh2yB1JY29uIjoiY2ggY2gtY2FsZW5kYXLLIE9wdHMiOltdLCJ2aXNpYsRJxXV9LCJkZXBhcnRtZW507ADayhXzANswWjJuYTl1MHFOeGRidUdJZFR4Z0RiyirYIf0A9egA38x69QDf7QCc%2FwDh5ADhaXRlbeYBU%2BkCPesB3SIs6ADWySjqAPL%2FALBl6QJJ7QCozhTmAJrGFO8AnH19&page=0&reportType=environment.smartReports.environmental")
        cy.get('.lev-textInput').type("jahnavi.b@codecraft.co.in")
        cy.get('.lev-sc-input').type("Prosight123")
        cy.get('.login_dN2jV').click();
        cy.contains('Select Assigned Owner').click({force:true});
        cy.get('.lev-sc-input').type("8th Floor Main Tower 123")
        cy.get("span").contains("8th Floor Main Tower 123").click()
        cy.contains('8th Floor Main Tower 123').click({force:true});
        cy.get('.lev-sc-input').type("10 West South therapy56712345")
        cy.get("span").contains("10 West South therapy56712345").click
        cy.contains('Select Equipment Type').click({force:true});
        cy.contains("Select All").prev().click();
        cy.contains("Select Equipment Name").click();
        cy.get("div[class*='checkboxButton_W1oCJ']").each(ele=>{
            console.log(ele.text())
        })
    })
})