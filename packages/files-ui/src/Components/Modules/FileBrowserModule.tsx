import {
  createStyles,
  ITheme,
  makeStyles,
  useMediaQuery,
  useTheme,
} from "@imploy/common-themes"
import React, { Fragment, useCallback } from "react"
import {
  Button,
  CheckboxInput,
  DeleteIcon,
  Divider,
  DownloadIcon,
  EditIcon,
  ExportIcon,
  FileImageSvg,
  FilePdfSvg,
  FileTextSvg,
  FolderSvg,
  formatBytes,
  FormikTextInput,
  MenuDropdown,
  MoreIcon,
  PlusIcon,
  ShareAltIcon,
  SortDirection,
  standardlongDateFormat,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeadCell,
  TableRow,
  Typography,
  Breadcrumb,
  Crumb,
  CircularProgressBar,
} from "@imploy/common-components"
import { useState } from "react"
import { useMemo } from "react"
import { useDrive, IFile } from "../../Contexts/DriveContext"
import { Formik, Form } from "formik"
import { object, string } from "yup"
import EmptySvg from "../../Media/Empty.svg"
import CreateFolderModule from "./CreateFolderModule"
import UploadFileModule from "./UploadFileModule"
import CustomModal from "../Elements/CustomModal"
import FilePreviewModal from "./FilePreviewModal"
import { getArrayOfPaths, getPathFromArray } from "../../Utils/pathUtils"
import UploadProgressModals from "./UploadProgressModals"
import DragDropModule from "./DragDropModule"

const useStyles = makeStyles(({ breakpoints, constants, palette }: ITheme) => {
  const desktopGridSettings = "50px 69px 3fr 190px 100px 45px !important"
  const mobileGridSettings = "69px 3fr 45px !important"
  return createStyles({
    root: {
      [breakpoints.down("sm")]: {
        paddingLeft: constants.generalUnit * 2,
        paddingRight: constants.generalUnit * 2,
      },
    },
    header: {
      display: "flex",
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      [breakpoints.down("sm")]: {
        marginTop: constants.generalUnit,
      },
    },
    controls: {
      display: "flex",
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      "& > button": {
        marginLeft: constants.generalUnit,
      },
    },
    breadCrumbContainer: {
      margin: `${constants.generalUnit * 2}px 0`,
      height: 22,
      [breakpoints.down("sm")]: {
        marginTop: constants.generalUnit * 3,
        marginBottom: 0,
      },
    },
    divider: {
      "&:before, &:after": {
        backgroundColor: palette.additional["gray"][4],
      },
      [breakpoints.up("sm")]: {
        margin: `${constants.generalUnit * 4.5}px 0`,
      },
      [breakpoints.down("sm")]: {
        margin: `${constants.generalUnit * 4.5}px 0 0`,
      },
    },
    noFiles: {
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      marginTop: "25vh",
      "& svg": {
        maxWidth: 180,
        marginBottom: constants.generalUnit * 3,
      },
    },
    tableRow: {
      [breakpoints.up("sm")]: {
        gridTemplateColumns: desktopGridSettings,
      },
      [breakpoints.down("sm")]: {
        gridTemplateColumns: mobileGridSettings,
      },
    },
    fileIcon: {
      display: "flex",
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      "& svg": {
        width: constants.generalUnit * 2.5,
      },
    },
    progressIcon: {
      display: "flex",
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
    },
    renameInput: {
      width: "100%",
      [breakpoints.up("sm")]: {
        margin: 0,
      },
      [breakpoints.down("sm")]: {
        margin: `${constants.generalUnit * 4.2}px 0`,
      },
    },
    menuIcon: {
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      width: 20,
      marginRight: constants.generalUnit * 1.5,
    },
    dropdownIcon: {
      "& svg": {
        height: 20,
        width: 20,
      },
    },
    dropdownOptions: {
      "& > *": {
        padding: 0,
      },
    },
    mobileButton: {},
    renameModal: {
      padding: constants.generalUnit * 4,
    },
    okButton: {
      marginLeft: constants.generalUnit,
      color: palette.common.white.main,
      backgroundColor: palette.common.black.main,
    },
    cancelButton: {
      [breakpoints.down("sm")]: {
        position: "fixed",
        bottom: 0,
        left: 0,
        width: "100%",
        height: constants?.mobileButtonHeight,
      },
    },
    modalRoot: {
      [breakpoints.down("sm")]: {},
    },
    modalInner: {
      [breakpoints.down("sm")]: {
        bottom:
          (constants?.mobileButtonHeight as number) + constants.generalUnit,
        borderTopLeftRadius: `${constants.generalUnit * 1.5}px`,
        borderTopRightRadius: `${constants.generalUnit * 1.5}px`,
        borderBottomLeftRadius: `${constants.generalUnit * 1.5}px`,
        borderBottomRightRadius: `${constants.generalUnit * 1.5}px`,
      },
    },
    renameHeader: {
      textAlign: "center",
    },
    renameFooter: {
      display: "flex",
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "flex-end",
    },
  })
})

export interface IFileBrowserProps {
  heading?: string
  // TODO: once pagination & unique content requests are present, this might change to a passed in function
  controls?: boolean
}

const FileBrowserModule: React.FC<IFileBrowserProps> = ({
  heading = "My Files",
  controls = true,
}: IFileBrowserProps) => {
  const classes = useStyles()
  const {
    deleteFile,
    downloadFile,
    renameFile,
    currentPath,
    updateCurrentPath,
    pathContents,
    uploadsInProgress,
  } = useDrive()
  const [editing, setEditing] = useState<string | undefined>()
  const [direction, setDirection] = useState<SortDirection>("descend")
  const [column, setColumn] = useState<"name" | "size" | "date_uploaded">(
    "name",
  )
  const [selected, setSelected] = useState<string[]>([])

  const [previewFileIndex, setPreviewFileIndex] = useState<number | undefined>(
    undefined,
  )

  const sortFoldersFirst = (a: IFile, b: IFile) =>
    a.content_type === "application/chainsafe-files-directory" &&
    a.content_type !== b.content_type
      ? -1
      : 1

  const items: IFile[] = useMemo(() => {
    if (!pathContents) return []

    switch (direction) {
      default: {
        // case "descend": {
        // case "name": {
        return pathContents
          .sort((a: IFile, b: IFile) => (a.name > b.name ? -1 : 1))
          .sort(sortFoldersFirst)
      }
      case "descend": {
        switch (column) {
          default: {
            // case "name": {
            return pathContents
              .sort((a: IFile, b: IFile) => (a.name > b.name ? -1 : 1))
              .sort(sortFoldersFirst)
          }
          case "size": {
            return pathContents
              .sort((a: IFile, b: IFile) => (a.size > b.size ? -1 : 1))
              .sort(sortFoldersFirst)
          }
          case "date_uploaded": {
            return pathContents
              .sort((a: IFile, b: IFile) =>
                a.date_uploaded > b.date_uploaded ? -1 : 1,
              )
              .sort(sortFoldersFirst)
          }
        }
      }
      case "ascend": {
        switch (column) {
          default: {
            // case "name": {
            return pathContents
              .sort((a: IFile, b: IFile) => (a.name < b.name ? -1 : 1))
              .sort(sortFoldersFirst)
          }
          case "size": {
            return pathContents
              .sort((a: IFile, b: IFile) => (a.size < b.size ? -1 : 1))
              .sort(sortFoldersFirst)
          }
          case "date_uploaded": {
            return pathContents
              .sort((a: IFile, b: IFile) =>
                a.date_uploaded < b.date_uploaded ? -1 : 1,
              )
              .sort(sortFoldersFirst)
          }
        }
      }
    }
  }, [pathContents, direction, column])

  const files = useMemo(() => {
    return items.filter(
      (i) => i.content_type !== "application/chainsafe-files-directory",
    )
  }, [items])

  const setNextPreview = () => {
    if (
      files &&
      previewFileIndex !== undefined &&
      previewFileIndex < files.length - 1
    ) {
      setPreviewFileIndex(previewFileIndex + 1)
    }
  }

  const setPreviousPreview = () => {
    if (files && previewFileIndex !== undefined && previewFileIndex > 0) {
      setPreviewFileIndex(previewFileIndex - 1)
    }
  }

  const clearPreview = () => {
    setPreviewFileIndex(undefined)
  }

  const handleSelect = (cid: string) => {
    if (selected.includes(cid)) {
      setSelected(selected.filter((selectedCid: string) => selectedCid !== cid))
    } else {
      setSelected([...selected, cid])
    }
  }

  const toggleAll = () => {
    if (selected.length === items.length) {
      setSelected([])
    } else {
      setSelected([...items.map((file: IFile) => file.cid)])
    }
  }

  const handleSortToggle = (
    targetColumn: "name" | "size" | "date_uploaded",
  ) => {
    if (column !== targetColumn) {
      setColumn(targetColumn)
      setDirection("descend")
    } else {
      if (direction === "ascend") {
        setDirection("descend")
      } else {
        setDirection("ascend")
      }
    }
  }

  const handleRename = async (path: string, new_path: string) => {
    // TODO set loading
    await renameFile({
      path: path,
      new_path: new_path,
    })
    setEditing(undefined)
  }

  const RenameSchema = object().shape({
    fileName: string()
      .min(1, "Please enter a file name")
      .max(65, "File name length exceeded")
      .required("File name is required"),
  })

  const arrayOfPaths = getArrayOfPaths(currentPath)
  const crumbs: Crumb[] = arrayOfPaths.map((path, index) => ({
    text: path,
    onClick: () =>
      updateCurrentPath(getPathFromArray(arrayOfPaths.slice(0, index + 1))),
  }))
  const { breakpoints }: ITheme = useTheme()
  const desktop = useMediaQuery(breakpoints.up("sm"))

  const [generalDropActive, setGeneralDropActive] = useState<number>(-1)

  const displayUpload = useCallback(() => {
    if (generalDropActive > 0) {
      clearTimeout(generalDropActive)
    }
    const timer = setTimeout(() => {
      setGeneralDropActive(-1)
    }, 1000)
    setGeneralDropActive(timer)
    return () => clearTimeout(timer)
  }, [generalDropActive])

  return (
    <article onDragEnter={displayUpload} className={classes.root}>
      <DragDropModule
        active={generalDropActive > -1}
        close={() => setGeneralDropActive(-1)}
      />
      <div className={classes.breadCrumbContainer}>
        {crumbs.length > 0 && (
          <Breadcrumb
            crumbs={crumbs}
            homeOnClick={() => updateCurrentPath("/")}
          />
        )}
      </div>
      <header className={classes.header}>
        <Typography variant="h1" component="h1">
          {heading}
        </Typography>
        <div className={classes.controls}>
          {controls && desktop ? (
            <Fragment>
              <CreateFolderModule />
              <UploadFileModule />
            </Fragment>
          ) : (
            controls &&
            !desktop && (
              <MenuDropdown
                classNames={{
                  icon: classes.dropdownIcon,
                  options: classes.dropdownOptions,
                }}
                autoclose={false}
                anchor="bottom-right"
                animation="none"
                indicator={PlusIcon}
                menuItems={[
                  {
                    contents: (
                      <CreateFolderModule
                        variant="primary"
                        fullsize
                        classNames={{
                          button: classes.mobileButton,
                        }}
                      />
                    ),
                  },
                  {
                    contents: (
                      <UploadFileModule
                        variant="primary"
                        fullsize
                        classNames={{
                          button: classes.mobileButton,
                        }}
                      />
                    ),
                  },
                ]}
              />
            )
          )}
        </div>
      </header>
      <Divider className={classes.divider} />
      {items.length === 0 ? (
        <section className={classes.noFiles}>
          <EmptySvg />
          <Typography variant="h4" component="h4">
            No files to show
          </Typography>
        </section>
      ) : (
        <Table
          fullWidth={true}
          // dense={true}
          striped={true}
          hover={true}
        >
          {desktop && (
            <TableHead>
              <TableRow type="grid" className={classes.tableRow}>
                <TableHeadCell>
                  <CheckboxInput
                    value={selected.length === items.length}
                    onChange={() => toggleAll()}
                  />
                </TableHeadCell>
                <TableHeadCell>
                  {/* 
                        Icon
                      */}
                </TableHeadCell>
                <TableHeadCell
                  sortButtons={true}
                  align="left"
                  onSortChange={() => handleSortToggle("name")}
                  sortDirection={column === "name" ? direction : undefined}
                  sortActive={column === "name"}
                >
                  Name
                </TableHeadCell>
                <TableHeadCell
                  sortButtons={true}
                  align="left"
                  onSortChange={() => handleSortToggle("date_uploaded")}
                  sortDirection={
                    column === "date_uploaded" ? direction : undefined
                  }
                  sortActive={column === "date_uploaded"}
                >
                  Date uploaded
                </TableHeadCell>
                <TableHeadCell
                  sortButtons={true}
                  align="left"
                  onSortChange={() => handleSortToggle("size")}
                  sortDirection={column === "size" ? direction : undefined}
                  sortActive={column === "size"}
                >
                  Size
                </TableHeadCell>
                <TableHeadCell>{/* Menu */}</TableHeadCell>
              </TableRow>
            </TableHead>
          )}
          <TableBody>
            {!desktop &&
              uploadsInProgress
                .filter(
                  (uploadInProgress) =>
                    uploadInProgress.path === currentPath &&
                    !uploadInProgress.complete &&
                    !uploadInProgress.error,
                )
                .map((uploadInProgress) => (
                  <TableRow
                    key={uploadInProgress.id}
                    className={classes.tableRow}
                    type="grid"
                  >
                    <TableCell className={classes.progressIcon}>
                      <CircularProgressBar
                        progress={uploadInProgress.progress}
                        size="small"
                        width={15}
                      />
                    </TableCell>
                    <TableCell align="left">
                      {uploadInProgress.noOfFiles > 1
                        ? `Uploading ${uploadInProgress.noOfFiles} files`
                        : uploadInProgress.fileName}
                    </TableCell>
                    <TableCell />
                  </TableRow>
                ))}
            {items.map((file: IFile, index: number) => {
              let Icon
              if (
                file.content_type === "application/chainsafe-files-directory"
              ) {
                Icon = FolderSvg
              } else if (file.content_type.includes("image")) {
                Icon = FileImageSvg
              } else if (file.content_type.includes("pdf")) {
                Icon = FilePdfSvg
              } else {
                Icon = FileTextSvg
              }
              return (
                <TableRow
                  key={`files-${index}`}
                  className={classes.tableRow}
                  type="grid"
                  rowSelectable={true}
                  selected={selected.includes(file.cid)}
                >
                  {desktop && (
                    <TableCell>
                      <CheckboxInput
                        value={selected.includes(file.cid)}
                        onChange={() => handleSelect(file.cid)}
                      />
                    </TableCell>
                  )}
                  <TableCell
                    className={classes.fileIcon}
                    onClick={() => {
                      file.content_type ===
                        "application/chainsafe-files-directory" &&
                        updateCurrentPath(`${currentPath}${file.name}`)
                    }}
                  >
                    <Icon />
                  </TableCell>
                  <TableCell
                    align="left"
                    onClick={() => {
                      file.content_type ===
                      "application/chainsafe-files-directory"
                        ? updateCurrentPath(`${currentPath}${file.name}`)
                        : !editing && setPreviewFileIndex(files?.indexOf(file))
                    }}
                  >
                    {editing === file.cid && desktop ? (
                      <Formik
                        initialValues={{
                          fileName: file.name,
                        }}
                        validationSchema={RenameSchema}
                        onSubmit={(values, actions) => {
                          handleRename(
                            `${currentPath}${file.name}`,
                            `${currentPath}${values.fileName}`,
                          )
                        }}
                      >
                        <Form>
                          <FormikTextInput
                            className={classes.renameInput}
                            name="fileName"
                            inputVariant="minimal"
                            placeholder="Please enter a file name"
                          />
                        </Form>
                      </Formik>
                    ) : editing === file.cid && !desktop ? (
                      <CustomModal
                        className={classes.modalRoot}
                        injectedClass={{
                          inner: classes.modalInner,
                        }}
                        closePosition="none"
                        active={editing === file.cid}
                        setActive={() => setEditing("")}
                      >
                        <Formik
                          initialValues={{
                            fileName: file.name,
                          }}
                          validationSchema={RenameSchema}
                          onSubmit={(values, actions) => {
                            handleRename(
                              `${currentPath}${file.name}`,
                              `${currentPath}${values.fileName}`,
                            )
                          }}
                        >
                          <Form className={classes.renameModal}>
                            <Typography
                              className={classes.renameHeader}
                              component="p"
                              variant="h5"
                            >
                              Rename File/Folder
                            </Typography>
                            <FormikTextInput
                              label="Name"
                              className={classes.renameInput}
                              name="fileName"
                              placeholder="Please enter a file name"
                            />
                            <footer className={classes.renameFooter}>
                              <Button
                                onClick={() => setEditing("")}
                                size="medium"
                                className={classes.cancelButton}
                                variant="outline"
                                type="button"
                              >
                                Cancel
                              </Button>
                              <Button
                                size="medium"
                                type="submit"
                                className={classes.okButton}
                              >
                                Update
                              </Button>
                            </footer>
                          </Form>
                        </Formik>
                      </CustomModal>
                    ) : (
                      file.name
                    )}
                  </TableCell>
                  {desktop && (
                    <Fragment>
                      <TableCell align="left">
                        {standardlongDateFormat(
                          new Date(file.date_uploaded),
                          true,
                        )}
                      </TableCell>
                      <TableCell align="left">
                        {formatBytes(file.size)}
                      </TableCell>
                    </Fragment>
                  )}
                  <TableCell align="right">
                    <MenuDropdown
                      animation="none"
                      anchor={desktop ? "bottom-center" : "bottom-right"}
                      menuItems={[
                        {
                          contents: (
                            <Fragment>
                              <ExportIcon className={classes.menuIcon} />
                              <span>Move</span>
                            </Fragment>
                          ),
                          onClick: () => console.log,
                        },
                        {
                          contents: (
                            <Fragment>
                              <ShareAltIcon className={classes.menuIcon} />
                              <span>Share</span>
                            </Fragment>
                          ),
                          onClick: () => console.log,
                        },
                        {
                          contents: (
                            <Fragment>
                              <EditIcon className={classes.menuIcon} />
                              <span>Rename</span>
                            </Fragment>
                          ),
                          onClick: () => setEditing(file.cid),
                        },
                        {
                          contents: (
                            <Fragment>
                              <DeleteIcon className={classes.menuIcon} />
                              <span>Delete</span>
                            </Fragment>
                          ),
                          onClick: () =>
                            deleteFile({
                              paths: [`${currentPath}${file.name}`],
                            }),
                        },
                        {
                          contents: (
                            <Fragment>
                              <DownloadIcon className={classes.menuIcon} />
                              <span>Download</span>
                            </Fragment>
                          ),
                          onClick: () => downloadFile(file.name),
                        },
                      ]}
                      indicator={MoreIcon}
                    />
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      )}
      {files && previewFileIndex !== undefined && (
        <FilePreviewModal
          file={files[previewFileIndex]}
          closePreview={clearPreview}
          nextFile={
            previewFileIndex < files.length - 1 ? setNextPreview : undefined
          }
          previousFile={previewFileIndex > 0 ? setPreviousPreview : undefined}
        />
      )}
      <UploadProgressModals />
    </article>
  )
}

export default FileBrowserModule
