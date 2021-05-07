import { useLocalStorage } from "@chainsafe/browser-storage-hooks"
import { CrossIcon, Typography } from "@chainsafe/common-components"
import { createStyles, makeStyles } from "@chainsafe/common-theme"
import { Trans } from "@lingui/macro"
import React, { useCallback } from "react"
import { CSFTheme } from "../Themes/types"
import { ROUTE_LINKS } from "./FilesRoutes"

const SURVEY_VERSION = 1
export const DISMISSED_SURVEY_KEY = `csf.dismissedSurveyBannerV${SURVEY_VERSION}`

const useStyles = makeStyles(
  ({ constants, palette }: CSFTheme) => {
    return createStyles({
      root: {
        backgroundColor: palette.primary.main,
        padding: constants.generalUnit,
        paddingLeft: constants.generalUnit * 2,
        marginTop: constants.generalUnit,
        borderRadius: 2,
        display: "flex"
      },
      banner: {
        color: constants.surveyBanner.color
      },
      link: {
        marginLeft: constants.generalUnit * 2,
        color: constants.surveyBanner.color,
        cursor: "pointer",
        outline: "none",
        textDecoration: "underline"
      },
      crossIconButton: {
        cursor: "pointer",

        "& span": {
          display: "flex",
          alignContent: "center",
          justifyContent: "center",
          height: "100%",
          fontSize: 12,
          marginRight: constants.generalUnit
        },
        "& svg": {
          fill: constants.surveyBanner.color
        }
      },
      spacer: {
        flex: 1
      }
    })
  })

interface Props {
    onHide: () => void
}

const SurveyBanner = ({ onHide }: Props) => {
  const classes = useStyles()
  const { localStorageSet } = useLocalStorage()

  const onClose = useCallback(() => {
    onHide()
    localStorageSet(DISMISSED_SURVEY_KEY, "true")
  }, [localStorageSet, onHide])

  const onOpen = useCallback(() => {
    onClose()
    window.open(ROUTE_LINKS.UserSurvey, "_blank")
  }, [onClose])

  return (
    <div className={classes.root}>
      <Typography
        variant="body1"
        className={classes.banner}>
        <Trans>
            Help us make Files better in under 30 seconds.
        </Trans>
        <span
          className={classes.link}
          onClick={onOpen}
        >
          <Trans>Continue</Trans>
        </span>
      </Typography>
      <div className={classes.spacer}/>
      <div
        className={classes.crossIconButton}
        onClick={onClose}
      >
        <CrossIcon fontSize="small" />
      </div>
    </div>
  )}

export default SurveyBanner