import React from "react"
import { createStyles, makeStyles } from "@chainsafe/common-theme"
import { UploadProgress } from "../../../Contexts/FilesContext"
import { ProgressBar, Typography, CheckCircleIcon, CloseCircleIcon } from "@chainsafe/common-components"
import clsx from "clsx"
import { plural, Trans } from "@lingui/macro"
import { CSFTheme } from "../../../Themes/types"

const useStyles = makeStyles(
  ({ constants, palette, animation, breakpoints }: CSFTheme) => {
    return createStyles({
      boxContainer: {
        backgroundColor: palette.additional["gray"][3],
        margin: `${constants.generalUnit}px 0`,
        border: `1px solid ${palette.additional["gray"][6]}`,
        padding: constants.generalUnit * 2,
        borderRadius: 4,
        [breakpoints.down("md")]: {
          margin: 0
        }
      },
      appearBox: {
        animation: `$slideLeft ${animation.translate}ms`,
        [breakpoints.down("md")]: {
          animation: `$slideUp ${animation.translate}ms`
        }
      },
      "@keyframes slideLeft": {
        from: { transform: "translate(100%)" },
        to: { transform: "translate(0)" }
      },
      "@keyframes slideUp": {
        from: { transform: "translate(0, 100%)" },
        to: { transform: "translate(0, 0)" }
      },
      contentContainer: {
        display: "flex",
        alignItems: "center",
        "& svg": {
          fill: constants.uploadAlert.icon
        }
      },
      marginBottom: {
        marginBottom: constants.generalUnit
      },
      marginRight: {
        marginRight: constants.generalUnit * 2
      }
    })
  }
)

interface IUploadBox {
  uploadInProgress: UploadProgress
}

const UploadBox: React.FC<IUploadBox> = (props) => {
  const { uploadInProgress } = props
  const {
    complete,
    error,
    noOfFiles,
    progress,
    errorMessage
  } = uploadInProgress
  const classes = useStyles()

  return (
    <>
      <div className={clsx(classes.appearBox, classes.boxContainer)}
        data-cy="upload-status-toast-message" >
        {complete ? (
          <div className={classes.contentContainer}>
            <CheckCircleIcon className={classes.marginRight} />
            <Typography
              variant="body1"
              component="p"
            >
              <Trans>Upload complete</Trans>
            </Typography>
          </div>
        ) : error ? (
          <div className={classes.contentContainer}>
            <CloseCircleIcon className={classes.marginRight} />
            <Typography
              variant="body1"
              component="p"
            >
              {errorMessage}
            </Typography>
          </div>
        ) : (
          <div>
            <Typography
              variant="body2"
              component="p"
              className={classes.marginBottom}
            >{plural(noOfFiles, {
                one: `Uploading and encrypting ${noOfFiles} file`,
                other: `Uploading and encrypting ${noOfFiles} files`
              })}</Typography>
            <ProgressBar
              progress={progress}
              size="small"
            />
          </div>
        )}
      </div>
    </>
  )
}

export default UploadBox
