// import textFile from "../fixtures/uploadedFiles/text-file.txt"

describe("File management", () => {
  it("can add files and cancel", () => {
    cy.web3Login()
    cy.get("[data-cy=upload-modal-button").click()
    cy.get("[data-cy=upload-file-form] input").attachFile("../fixtures/uploadedFiles/text-file.txt")
    cy.get(".scrollbar li").should("have.length", 1)
    cy.get("[data-cy=upload-cancel-button").click()
    cy.get("[data-cy=files-app-header").should("be.visible")
  })

  it("can add/remove files and upload", () => {
    cy.web3Login()
    cy.get("[data-cy=upload-modal-button").click()
    cy.get("[data-cy=upload-file-form] input").attachFile("../fixtures/uploadedFiles/text-file.txt")
    cy.get(".scrollbar li").should("have.length", 1)
    cy.get("[data-cy=upload-file-form] input").attachFile("../fixtures/uploadedFiles/logo.png")
    cy.get(".scrollbar li").should("have.length", 2)
    cy.get(".removeFileIcon").first().click()
    cy.get(".scrollbar li").should("have.length", 1)
    cy.get("[data-cy=upload-file-form] input").attachFile("../fixtures/uploadedFiles/text-file.txt")
    cy.get(".scrollbar li").should("have.length", 2)
    cy.get("[data-cy=upload-ok-button").click()
    cy.get("[data-cy=files-app-header").should("be.visible")
    cy.get("[data-cy=file-item-row]").should("have.length", 2)
  })
})
