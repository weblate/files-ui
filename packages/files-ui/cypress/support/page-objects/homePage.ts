import { basePage } from "./basePage"

export const homePage = {
  ...basePage,

  // main browser elements
  uploadButton: () => cy.get("[data-cy=upload-modal-button]"),
  uploadFileForm: () => cy.get("[data-cy=upload-file-form] input"),

  // file browser row elements
  fileItemRow: () => cy.get("[data-cy=file-item-row]", { timeout: 20000 }),
  fileItemName: () => cy.get("[data-cy=file-item-name]"),
  fileRenameInput: () => cy.get("[data-cy=rename-form] input"),
  fileRenameSubmitButton: () => cy.get("[data-cy=rename-submit-button]"),
  fileRenameErrorLabel: () => cy.get("[data-cy=rename-form] span.minimal.error"),
  fileItemKebabButton: () => cy.get("[data-testid=dropdown-title-fileDropdown]"),

  // upload modal elements
  startUploadButton: () => cy.get("[data-cy=upload-ok-button]"),
  uploadCancelButton: () => cy.get("[data-cy=upload-cancel-button"),
  fileListRemoveButton: () => cy.get("[data-testid=file-list-remove-button-fileUpload]"),
  fileUploadList: () => cy.get("[data-testid=file-list-fileUpload] li"),
  fileUploadDropzone : () => cy.get("[data-testid=file-input-dropzone-fileUpload]"),

  // menu elements
  previewMenuOption: () => cy.get("[data-cy=menu-preview]"),
  downloadMenuOption: () => cy.get("[data-cy=menu-download]"),
  infoMenuOption: () => cy.get("[data-cy=menu-info]"),
  renameMenuOption: () => cy.get("[data-cy=menu-rename]"),
  moveMenuOption: () => cy.get("[data-cy=menu-move]"),
  deleteMenuOption: () => cy.get("[data-cy=menu-delete]"),

  // helpers and convenience functions
  uploadFile(filePath: string) {
    this.uploadButton().click()
    this.uploadFileForm().attachFile(filePath)
    this.fileUploadList().should("have.length", 1)
    this.startUploadButton().click()
    this.uploadFileForm().should("not.exist")
  }
}
