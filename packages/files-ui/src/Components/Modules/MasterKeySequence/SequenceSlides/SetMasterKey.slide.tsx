import { createStyles, ITheme, makeStyles } from "@chainsafe/common-theme"
import React from "react"
import {
  Button,
  FormikCheckboxInput,
  FormikTextInput,
  Typography,
} from "@chainsafe/common-components"
import clsx from "clsx"
import { Form, Formik } from "formik"
import * as yup from "yup"
import { ROUTE_LINKS } from "../../../FilesRoutes"
import { useDrive } from "../../../../Contexts/DriveContext"
import zxcvbn from "zxcvbn"

const useStyles = makeStyles(({ breakpoints, constants, palette }: ITheme) =>
  createStyles({
    root: {
      maxWidth: 320,
      [breakpoints.down("md")]: {},
      "& p": {
        fontWeight: 400,
        marginBottom: constants.generalUnit * 2,
        [breakpoints.down("md")]: {
          color: palette.common.white.main,
        },
      },
      "& h2": {
        textAlign: "center",
        marginBottom: constants.generalUnit * 4.125,
        [breakpoints.down("md")]: {
          color: palette.common.white.main,
        },
      },
    },
    input: {
      margin: 0,
      width: "100%",
      marginBottom: constants.generalUnit * 1.5,
      "& span": {
        [breakpoints.down("md")]: {
          color: palette.common.white.main,
        },
      },
    },
    highlight: {
      fontWeight: 700,
      textDecoration: "underline",
    },
    checkbox: {
      marginBottom: constants.generalUnit,
      [breakpoints.up("md")]: {
        color: palette.additional["gray"][8],
      },
      [breakpoints.down("md")]: {
        color: palette.common.white.main,
        "& a": {
          color: `${palette.common.white.main} !important`,
        },
      },
    },
    button: {
      marginTop: constants.generalUnit * 3,
    },
    inputLabel: {
      fontSize: "16px",
      lineHeight: "24px",
      color: palette.additional["gray"][8],
      marginBottom: constants.generalUnit,
    },
  }),
)

interface ISetMasterKeySlide {
  className?: string
}

const SetMasterKeySlide: React.FC<ISetMasterKeySlide> = ({
  className,
}: ISetMasterKeySlide) => {
  const classes = useStyles()
  const { secureDrive } = useDrive()

  const masterKeyValidation = yup.object().shape({
    masterKey: yup
      .string()
      .test(
        "Complexity",
        "Encryption password needs to be more complex",
        async (val: string | null | undefined | object) => {
          if (val === undefined) {
            return false
          }

          const complexity = zxcvbn(`${val}`)
          if (complexity.score >= 3) {
            return true
          }
          return false
        },
      )
      .required("Please provide an encryption password"),
    confirmMasterKey: yup
      .string()
      .oneOf(
        [yup.ref("masterKey"), undefined],
        "Encryption password must match",
      )
      .required("Encryption password confirmation is required'"),
    privacyPolicy: yup
      .boolean()
      .oneOf([true], "Please accept the privacy policy"),
    terms: yup.boolean().oneOf([true], "Please accept the terms & conditions."),
  })

  return (
    <section className={clsx(classes.root, className)}>
      <Typography variant="h2" component="h2">
        Set an Encryption Password
      </Typography>
      <Formik
        initialValues={{
          masterKey: "",
          confirmMasterKey: "",
          privacyPolicy: false,
          terms: false,
        }}
        validationSchema={masterKeyValidation}
        onSubmit={async (values, helpers) => {
          helpers.setSubmitting(true)
          secureDrive(values.masterKey)
          helpers.setSubmitting(false)
        }}
      >
        <Form>
          <FormikTextInput
            type="password"
            className={classes.input}
            name="masterKey"
            label="Encryption Password:"
            labelClassName={classes.inputLabel}
          />
          <FormikTextInput
            type="password"
            className={classes.input}
            name="confirmMasterKey"
            label="Confirm Encryption Password:"
            labelClassName={classes.inputLabel}
          />
          <Typography variant="h5" component="p">
            Please record your encryption password somewhere safe. <br />
            Forgetting this password means{" "}
            <span className={classes.highlight}>
              you are permanently locked out of your account.
            </span>
          </Typography>
          <FormikCheckboxInput
            className={classes.checkbox}
            name="privacyPolicy"
            label={
              <>
                I have read the{" "}
                <a
                  rel="noopener noreferrer"
                  href={ROUTE_LINKS.PrivacyPolicy}
                  target="_blank"
                >
                  Privacy Policy
                </a>
              </>
            }
          />
          <FormikCheckboxInput
            className={classes.checkbox}
            name="terms"
            label={
              <>
                I have read the{" "}
                <a
                  rel="noopener noreferrer"
                  href={ROUTE_LINKS.Terms}
                  target="_blank"
                >
                  Terms of Service
                </a>
              </>
            }
          />
          <Button className={classes.button} fullsize type="submit">
            Set Encryption Password
          </Button>
        </Form>
      </Formik>
    </section>
  )
}

export default SetMasterKeySlide