import {
  Button,
  FormikTextInput,
  Grid,
  Typography
} from "@chainsafe/common-components"
import * as yup from "yup"
import {
  createStyles,
  makeStyles,
  useMediaQuery
} from "@chainsafe/common-theme"
import React, { useRef, useEffect, useState } from "react"
import { Formik, Form } from "formik"
import CustomModal from "../../Elements/CustomModal"
import CustomButton from "../../Elements/CustomButton"
import { Trans } from "@lingui/macro"
import { CSFTheme } from "../../../Themes/types"
import { useFileBrowser } from "../../../Contexts/FileBrowserContext"
import { useFilesApi } from "../../../Contexts/FilesApiContext"


const useStyles = makeStyles(
  ({ breakpoints, constants, typography, zIndex }: CSFTheme) => {
    return createStyles({
      root: {
        padding: constants.generalUnit * 4,
        flexDirection: "column"
      },
      modalRoot: {
        zIndex: zIndex?.blocker,
        [breakpoints.down("md")]: {}
      },
      modalInner: {
        backgroundColor: constants.createFolder.backgroundColor,
        color: constants.createFolder.color,
        [breakpoints.down("md")]: {
          bottom:
          Number(constants?.mobileButtonHeight) + constants.generalUnit,
          borderTopLeftRadius: `${constants.generalUnit * 1.5}px`,
          borderTopRightRadius: `${constants.generalUnit * 1.5}px`,
          maxWidth: `${breakpoints.width("md")}px !important`
        }
      },
      input: {
        marginBottom: constants.generalUnit * 2
      },
      okButton: {
        marginLeft: constants.generalUnit
      },
      cancelButton: {
        [breakpoints.down("md")]: {
          position: "fixed",
          bottom: 0,
          left: 0,
          width: "100%",
          height: constants?.mobileButtonHeight
        }
      },
      label: {
        fontSize: 14,
        lineHeight: "22px"
      },
      heading: {
        color: constants.createFolder.color,
        fontWeight: typography.fontWeight.semibold,
        textAlign: "center",
        marginBottom: constants.generalUnit * 4
      }
    })
  }
)

interface ICreateFolderModalProps {
  modalOpen: boolean
  close: () => void
}

const CreateFolderModal: React.FC<ICreateFolderModalProps> = ({
  modalOpen,
  close
}: ICreateFolderModalProps) => {
  const classes = useStyles()
  const { filesApiClient } = useFilesApi()
  const { currentPath, refreshContents, bucket } = useFileBrowser()
  const [creatingFolder, setCreatingFolder] = useState(false)
  const desktop = useMediaQuery("md")
  const inputRef = useRef<any>(null)

  useEffect(() => {
    if (modalOpen) {
      setTimeout(() => inputRef.current?.focus(), 100)
    }
  }, [modalOpen])

  const folderNameValidator = yup.object().shape({
    name: yup
      .string()
      .required("Folder name is required")
      .test(
        "Invalid name",
        "Folder name cannot contain '/' character",
        (val: string | null | undefined) => !!val && !val.includes("/")
      )
  })

  return (
    <CustomModal
      className={classes.modalRoot}
      injectedClass={{
        inner: classes.modalInner
      }}
      active={modalOpen}
      closePosition="none"
      maxWidth="sm"
    >
      <Formik
        initialValues={{
          name: ""
        }}
        validationSchema={folderNameValidator}
        validateOnChange={false}
        onSubmit={async (values, helpers) => {
          if (!bucket) return
          helpers.setSubmitting(true)
          try {
            setCreatingFolder(true)
            await filesApiClient.addBucketDirectory(bucket.id, { path: `${currentPath}/${values.name}` })
            refreshContents && await refreshContents()
            setCreatingFolder(false)
            helpers.resetForm()
            close()
          } catch (errors) {
            setCreatingFolder(false)
            if (errors[0].message.includes("Entry with such name can")) {
              helpers.setFieldError("name", "Folder name is already in use")
            } else {
              helpers.setFieldError("name", errors[0].message)
            }
          }
          helpers.setSubmitting(false)
        }}
      >
        <Form>
          <div className={classes.root}>
            {!desktop && (
              <Grid
                item
                xs={12}
                sm={12}
              >
                <Typography
                  className={classes.heading}
                  variant="h5"
                  component="h5"
                >
                  <Trans>Create Folder</Trans>
                </Typography>
              </Grid>
            )}
            <Grid
              item
              xs={12}
              sm={12}
              className={classes.input}
            >
              <FormikTextInput
                name="name"
                size="large"
                placeholder="Name"
                labelClassName={classes.label}
                label="Folder Name"
                ref={inputRef}
              />
            </Grid>
            <Grid
              item
              flexDirection="row"
              justifyContent="flex-end"
            >
              <CustomButton
                onClick={() => close()}
                size="medium"
                className={classes.cancelButton}
                variant={desktop ? "outline" : "gray"}
                type="button"
              >
                <Trans>Cancel</Trans>
              </CustomButton>
              <Button
                size={desktop ? "medium" : "large"}
                variant="primary"
                type="submit"
                className={classes.okButton}
                loading={creatingFolder}
              >
                {desktop ? <Trans>OK</Trans> : <Trans>Create</Trans>}
              </Button>
            </Grid>
          </div>
        </Form>
      </Formik>
    </CustomModal>
  )
}

export default CreateFolderModal
