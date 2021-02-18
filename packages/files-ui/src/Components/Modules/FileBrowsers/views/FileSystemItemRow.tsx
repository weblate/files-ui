import React, { Fragment } from "react"
import {
  TableRow,
  TableCell,
  FormikTextInput,
  Typography,
  Button,
  formatBytes,
  MenuDropdown,
  MoreIcon,
  FileImageSvg,
  FilePdfSvg,
  FileTextSvg,
  FolderFilledSvg,
  DownloadSvg,
  DeleteSvg,
  EditSvg,
  IMenuItem,
  ExportIcon,
  ShareAltIcon,
  CheckSvg,
  ExclamationCircleInverseIcon,
  RecoverSvg,
  ZoomInIcon,
  CheckboxInput,
} from "@chainsafe/common-components"
import {
  makeStyles,
  ITheme,
  createStyles,
  useDoubleClick,
} from "@chainsafe/common-theme"
import clsx from "clsx"
import { Formik, Form } from "formik"
import {
  FileSystemItem,
  StoreEntryType,
} from "../../../../Contexts/DriveContext"
import CustomModal from "../../../Elements/CustomModal"
import { Trans } from "@lingui/macro"
import { useDrag, useDrop } from "react-dnd"
import { DragTypes } from "../DragConstants"
import { NativeTypes } from "react-dnd-html5-backend"
import { FileOperation, IFileConfigured } from "../types"

const useStyles = makeStyles(({ breakpoints, constants, palette }: ITheme) => {
  // const desktopGridSettings = "50px 69px 3fr 190px 100px 45px !important"
  const desktopGridSettings = "50px 69px 3fr 190px 60px !important"
  const mobileGridSettings = "69px 3fr 45px !important"
  return createStyles({
    tableRow: {
      border: `2px solid transparent`,
      [breakpoints.up("md")]: {
        gridTemplateColumns: desktopGridSettings,
      },
      [breakpoints.down("md")]: {
        gridTemplateColumns: mobileGridSettings,
      },
      "&.droppable": {
        border: `2px solid ${palette.additional["geekblue"][6]}`,
      },
    },
    fileIcon: {
      display: "flex",
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      "& svg": {
        width: constants.generalUnit * 2.5,
        fill: palette.additional["gray"][8],
      },
    },
    folderIcon: {
      "& svg": {
        fill: palette.additional["gray"][9],
      },
    },
    renameInput: {
      width: "100%",
      [breakpoints.up("md")]: {
        margin: 0,
      },
      [breakpoints.down("md")]: {
        margin: `${constants.generalUnit * 4.2}px 0`,
      },
    },
    modalRoot: {
      [breakpoints.down("md")]: {},
    },
    modalInner: {
      [breakpoints.down("md")]: {
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
    renameModal: {
      padding: constants.generalUnit * 4,
    },
    okButton: {
      marginLeft: constants.generalUnit,
      color: palette.common.white.main,
      backgroundColor: palette.common.black.main,
    },
    cancelButton: {
      [breakpoints.down("md")]: {
        position: "fixed",
        bottom: 0,
        left: 0,
        width: "100%",
        height: constants?.mobileButtonHeight,
      },
    },
    menuIcon: {
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      width: 20,
      marginRight: constants.generalUnit * 1.5,
      "& svg": {
        fill: palette.additional["gray"][7],
      },
    },
    desktopRename: {
      display: "flex",
      flexDirection: "row",
      "& svg": {
        width: 20,
        height: 20,
      },
    },
    filename: {
      whiteSpace: "nowrap",
      overflow: "hidden",
      textOverflow: "ellipsis",
    },
  })
})

interface IFileSystemItemRowProps {
  index: number
  file: IFileConfigured
  files: IFileConfigured[]
  currentPath: string
  updateCurrentPath(
    path: string,
    newSoreEntry?: StoreEntryType,
    showLoading?: boolean,
  ): void
  selected: string[]
  handleSelect(selected: string): void
  editing: string | undefined
  setEditing(editing: string | undefined): void
  RenameSchema: any
  handleRename?(path: string, newPath: string): Promise<void>
  handleMove?(path: string, newPath: string): Promise<void>
  deleteFile?(cid: string): void
  recoverFile?(cid: string): void
  downloadFile?(cid: string): Promise<void>
  handleUploadOnDrop?(
    files: File[],
    fileItems: DataTransferItemList,
    path: string,
  ): void
  setPreviewFileIndex(fileIndex: number | undefined): void
  desktop: boolean
  setMoveFileData(moveFileData: {
    modal: boolean
    fileData: FileSystemItem | FileSystemItem[]
  }): void
  setFileInfoPath(path: string): void
}

const FileSystemItemRow: React.FC<IFileSystemItemRowProps> = ({
  index,
  file,
  files,
  currentPath,
  updateCurrentPath,
  selected,
  editing,
  setEditing,
  RenameSchema,
  handleRename,
  handleMove,
  deleteFile,
  recoverFile,
  downloadFile,
  handleUploadOnDrop,
  setPreviewFileIndex,
  setMoveFileData,
  setFileInfoPath,
  desktop,
  handleSelect,
}) => {
  let Icon
  if (file.isFolder) {
    Icon = FolderFilledSvg
  } else if (file.content_type.includes("image")) {
    Icon = FileImageSvg
  } else if (file.content_type.includes("pdf")) {
    Icon = FilePdfSvg
  } else {
    Icon = FileTextSvg
  }

  const classes = useStyles()

  const menuOptions: Record<FileOperation, IMenuItem> = {
    rename: {
      contents: (
        <Fragment>
          <EditSvg className={classes.menuIcon} />
          <span>
            <Trans>Rename</Trans>
          </span>
        </Fragment>
      ),
      onClick: () => setEditing(file.cid),
    },
    delete: {
      contents: (
        <Fragment>
          <DeleteSvg className={classes.menuIcon} />
          <span>
            <Trans>Delete</Trans>
          </span>
        </Fragment>
      ),
      onClick: () => deleteFile && deleteFile(file.cid),
    },
    download: {
      contents: (
        <Fragment>
          <DownloadSvg className={classes.menuIcon} />
          <span>
            <Trans>Download</Trans>
          </span>
        </Fragment>
      ),
      onClick: () => downloadFile && downloadFile(file.cid),
    },
    move: {
      contents: (
        <Fragment>
          <ExportIcon className={classes.menuIcon} />
          <span>Move</span>
        </Fragment>
      ),
      onClick: () => setMoveFileData({ modal: true, fileData: file }),
    },
    share: {
      contents: (
        <Fragment>
          <ShareAltIcon className={classes.menuIcon} />
          <span>Share</span>
        </Fragment>
      ),
      onClick: () => console.log,
    },
    info: {
      contents: (
        <Fragment>
          <ExclamationCircleInverseIcon className={classes.menuIcon} />
          <span>Info</span>
        </Fragment>
      ),
      onClick: () => setFileInfoPath(`${currentPath}${file.name}`),
    },
    recover: {
      contents: (
        <Fragment>
          <RecoverSvg className={classes.menuIcon} />
          <span>Recover</span>
        </Fragment>
      ),
      onClick: () => recoverFile && recoverFile(file.cid),
    },
    preview: {
      contents: (
        <Fragment>
          <ZoomInIcon className={classes.menuIcon} />
          <span>Preview</span>
        </Fragment>
      ),
      onClick: () => setPreviewFileIndex(files?.indexOf(file)),
    },
  }

  const menuItems: IMenuItem[] = file.operations.map(
    (itemOperation) => menuOptions[itemOperation],
  )

  const [, dragMoveRef, preview] = useDrag({
    item: { type: DragTypes.MOVABLE_FILE, payload: file },
  })

  const [{ isOverMove }, dropMoveRef] = useDrop({
    accept: DragTypes.MOVABLE_FILE,
    canDrop: () => file.isFolder,
    drop: async (item: {
      type: typeof DragTypes.MOVABLE_FILE
      payload: FileSystemItem
    }) => {
      handleMove &&
        (await handleMove(
          `${currentPath}${item.payload.name}`,
          `${currentPath}${file.name}/${item.payload.name}`,
        ))
    },
    collect: (monitor) => ({
      isOverMove: monitor.isOver(),
    }),
  })

  const [{ isOverUpload }, dropUploadRef] = useDrop({
    accept: [NativeTypes.FILE],
    drop: (item: any) => {
      handleUploadOnDrop &&
        handleUploadOnDrop(item.files, item.items, `${currentPath}${file.name}`)
    },
    collect: (monitor) => ({
      isOverUpload: monitor.isOver(),
    }),
  })

  function attachRef(el: any) {
    if (file.isFolder) {
      dropMoveRef(el)
      dropUploadRef(el)
    } else {
      dragMoveRef(el)
    }
  }

  // Hook cant be called conditionally
  const doubleClick = useDoubleClick(
    () => {
      handleSelect(file.cid)
    },
    () => {
      file.isFolder
        ? updateCurrentPath(`${currentPath}${file.name}`)
        : setPreviewFileIndex(files?.indexOf(file))
    },
  )

  const onFolderOrFileClicks = desktop
    ? doubleClick
    : () => {
        file.isFolder
          ? updateCurrentPath(`${currentPath}${file.name}`)
          : setPreviewFileIndex(files?.indexOf(file))
      }

  return (
    <TableRow
      key={`files-${index}`}
      className={clsx(classes.tableRow, {
        droppable: file.isFolder && (isOverMove || isOverUpload),
        folder: file.isFolder,
      })}
      type="grid"
      rowSelectable={true}
      ref={attachRef}
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
        className={clsx(classes.fileIcon, file.isFolder && classes.folderIcon)}
        onClick={onFolderOrFileClicks}
      >
        <Icon />
      </TableCell>
      <TableCell
        ref={preview}
        align="left"
        className={classes.filename}
        onClick={() => {
          if (!editing) {
            onFolderOrFileClicks()
          }
        }}
      >
        {editing === file.cid && desktop ? (
          <Formik
            initialValues={{
              fileName: file.name,
            }}
            validationSchema={RenameSchema}
            onSubmit={(values, actions) => {
              handleRename &&
                handleRename(
                  `${currentPath}${file.name}`,
                  `${currentPath}${values.fileName}`,
                )
              setEditing(undefined)
            }}
          >
            <Form className={classes.desktopRename}>
              <FormikTextInput
                className={classes.renameInput}
                name="fileName"
                inputVariant="minimal"
                onKeyDown={(event) => {
                  if (event.key === "Escape") {
                    setEditing(undefined)
                  }
                }}
                placeholder={`Please enter a ${
                  file.isFolder ? "folder" : "file"
                } name`}
                autoFocus={editing === file.cid}
              />
              <Button variant="dashed" size="small" type="submit">
                <CheckSvg />
              </Button>
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
                handleRename &&
                  handleRename(
                    `${currentPath}${file.name}`,
                    `${currentPath}${values.fileName}`,
                  )
                setEditing(undefined)
              }}
            >
              <Form className={classes.renameModal}>
                <Typography
                  className={classes.renameHeader}
                  component="p"
                  variant="h5"
                >
                  <Trans>Rename File/Folder</Trans>
                </Typography>
                <FormikTextInput
                  label="Name"
                  className={classes.renameInput}
                  name="fileName"
                  placeholder={`Please enter a ${
                    file.isFolder ? "folder" : "file"
                  } name`}
                  autoFocus={editing === file.cid}
                />
                <footer className={classes.renameFooter}>
                  <Button
                    onClick={() => setEditing("")}
                    size="medium"
                    className={classes.cancelButton}
                    variant="outline"
                    type="button"
                  >
                    <Trans>Cancel</Trans>
                  </Button>
                  <Button
                    size="medium"
                    type="submit"
                    className={classes.okButton}
                  >
                    <Trans>Update</Trans>
                  </Button>
                </footer>
              </Form>
            </Formik>
          </CustomModal>
        ) : (
          <Typography>{file.name}</Typography>
        )}
      </TableCell>
      {desktop && (
        <>
          {/* <TableCell align="left">
            {standardlongDateFormat(new Date(file.date_uploaded), true)}
          </TableCell> */}

          <TableCell align="left">
            {!file.isFolder && formatBytes(file.size)}
          </TableCell>
        </>
      )}
      <TableCell align="right">
        <MenuDropdown
          animation="none"
          anchor={desktop ? "bottom-center" : "bottom-right"}
          menuItems={menuItems}
          indicator={MoreIcon}
        />
      </TableCell>
    </TableRow>
  )
}

export default FileSystemItemRow