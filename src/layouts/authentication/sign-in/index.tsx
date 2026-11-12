import { useState } from "react";
import { toast } from "react-toastify";

import { useNavigate } from "react-router-dom";

import { Grid, InputAdornment } from "@mui/material";

// Material Dashboard 2 PRO React TS components
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDInput from "components/MDInput";
import MDButton from "components/MDButton";
import MDCircularLoader from "components/MDCircularLoader";
import { useMaterialUIController } from "context";
import PageLayout from "examples/LayoutContainers/PageLayout";
import { MuiOtpInput } from "mui-one-time-password-input";

// Image
import OneWireLogo from "assets/images/01wire-logo.png";
import PersonOutlineIcon from "@mui/icons-material/PersonOutline";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import EmailOutlinedIcon from "@mui/icons-material/EmailOutlined";

import { ISignupVars, SIGNUP } from "graphql/mutations/signup";
import { useLazyQuery, useMutation, useQuery } from "@apollo/client";
import { ILoginVars, LOGIN } from "graphql/mutations/login";
import { GET_AUTH_STATUS, IGetAuthStatusVars, IGetAuthStatus } from "graphql/queries/getAuthStatus";
import { VERIFY_OTP, IVerifyOtpVars } from "graphql/mutations/verifyOtp";
import { RESET_PASSWORD, IResetPasswordVars } from "graphql/mutations/resetPassword";
import { LOGIN_VIA_OTP, ILoginOtpVars } from "graphql/mutations/loginViaOtp";
import { validateEmail } from "../utils";
import { brandName } from "constants/index";

// Turns any sign-in error into a clear message for the person signing in
const SERVER_MESSAGES: [RegExp, string][] = [
  [/incorrect username or password|no account found/i, "Incorrect email or password"],
  [/otp invalid/i, "That code is not right. Please try again."],
  [/otp expired/i, "That code has expired. Please ask for a new one."],
  [/otp blocked/i, "Too many wrong codes. Please ask for a new one."],
  [/user not found/i, "No account found with this email."],
];
// Same rule the new-password screen shows
const passwordProblem = (p: string): string =>
  p.length < 8
    ? "Use at least 8 characters for your new password"
    : !/[A-Za-z]/.test(p) || !/[0-9]/.test(p)
    ? "Use at least one letter and one number in your new password"
    : "";
const friendlyError = (err: any): string => {
  const raw = err?.graphQLErrors?.[0]?.message || err?.message || "";
  if (err?.networkError || /failed to fetch|networkerror|load failed|network request failed/i.test(raw)) {
    return "Can't reach the server. Check your internet and try again.";
  }
  const known = SERVER_MESSAGES.find(([re]) => re.test(raw));
  if (known) return known[1];
  return raw ? raw.charAt(0).toUpperCase() + raw.slice(1) : "Something went wrong. Please try again.";
};
// Same message only once on screen, even if Enter is pressed again
const showError = (message: string) => toast.error(message, { toastId: message });

function SignIn(): JSX.Element {
  const navigate = useNavigate();
  const [controller] = useMaterialUIController();
  const { darkMode } = controller;

  const [email, setEmail] = useState<string>("");
  const [fullName, setFullName] = useState<string>("");
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [isSignup, setIsSignUp] = useState<boolean>(false);
  const [password, setPassword] = useState<string>("");
  const [showOtp, setShowOtp] = useState<string>("");
  const [otp, setOtp] = useState<string>("");
  const [forgotPsw, setForgotPsw] = useState<string>("");
  // true while going through "Forgot password": code -> new password
  const [resetMode, setResetMode] = useState<boolean>(false);
  const [loading, setLoading] = useState(false);

  const [emailError, setEmailError] = useState("");

  const [signupMutation] = useMutation<ISignupVars>(SIGNUP);
  const [loginMutation] = useMutation<ILoginVars>(LOGIN);
  const [verifyOtp] = useMutation<IVerifyOtpVars>(VERIFY_OTP);
  const [resetPassword] = useMutation<IResetPasswordVars>(RESET_PASSWORD);
  const [sendCode] = useMutation<any, ILoginOtpVars>(LOGIN_VIA_OTP);

  const [getAuthStatus] = useLazyQuery<IGetAuthStatusVars>(GET_AUTH_STATUS);

  const handleEmailSubmit = async () => {
    setLoading(true);
    if (email) {
      const isEmailValid = validateEmail(email);
      if (isEmailValid) {
        setEmailError("");
        getAuthStatus({
          variables: {
            email,
          },
        })
          .then(async (res: any) => {
            // A lazy query resolves (not rejects) when the request fails
            if (res?.error || !res?.data?.getAuthStatus) {
              setLoading(false);
              showError(friendlyError(res?.error));
              return;
            }
            const status = res.data.getAuthStatus.status;
            if (status === "NOT_FOUND") {
              setIsSignUp(true);
            } else if (status === "EMAIL_NOT_VERIFIED") {
              toast.error("Your email isn't verified yet. We've sent you a code.");
              await handleForgotPassword(true);
            } else {
              setShowPassword(true);
            }
            setLoading(false);
          })
          .catch((err) => {
            setLoading(false);
            showError(friendlyError(err));
          });
      } else {
        setEmailError("Invalid Email Address");
        showError("Please enter a valid email address");
      }
    } else {
      setEmailError("Invalid Email Address");
      showError("Please enter your email");
    }
    setLoading(false);
  };

  // Emails a 4-digit code (also used by "Resend OTP?"); resetPsw = then ask for a new password
  const handleForgotPassword = async (resetPsw = false) => {
    if (!email) {
      showError("Please enter your email");
      return;
    }
    setLoading(true);
    try {
      const res: any = await sendCode({ variables: { email } });
      const token = res?.data?.loginViaOtp?.token;
      if (!token) throw new Error("Could not send the code. Please try again.");
      setResetMode(resetPsw);
      setShowPassword(false);
      setPassword("");
      setOtp("");
      setForgotPsw("");
      setShowOtp(token);
      toast.success(`We've sent a 4-digit code to ${email}`, { toastId: "otp-sent" });
    } catch (err) {
      showError(friendlyError(err));
    } finally {
      setLoading(false);
    }
  };

  // Back from the code / new-password screens to the normal sign-in
  const backToSignIn = () => {
    setShowOtp("");
    setForgotPsw("");
    setResetMode(false);
    setOtp("");
    setPassword("");
    setShowPassword(!!email);
  };

  const handleLogin = async () => {
    if (password) {
      try {
        setLoading(true);
        loginMutation({
          variables: {
            password,
            email,
          },
        })
          .then((res: any) => {
            if (res.data) {
              const roleVal = res?.data?.login?.type;
              localStorage.setItem("token", res.data.login.token);
              localStorage.setItem("role", roleVal);
              const routeVal = roleVal === "ADMIN" ? "/overview" : "/";
              toast.success("Logged in successfully");
              navigate(routeVal);
            }
          })
          .catch((err) => {
            setLoading(false);
            showError(friendlyError(err));
          });
      } catch (error: any) {
        setLoading(false);
        showError(friendlyError(error));
      }
    } else {
      showError("Please enter your password");
    }
  };

  const handleSignup = async () => {
    if (fullName && password) {
      setLoading(true);
      signupMutation({
        variables: { email, fullName, password },
      })
        .then((res: any) => {
          const signup = res?.data?.signup;
          if (signup?.status === "LOGGED_IN" && signup?.token) {
            localStorage.setItem("token", signup.token);
            localStorage.setItem("role", signup.type);
            toast.success("Signed up successfully");
            navigate(signup.type === "ADMIN" ? "/overview" : "/");
          } else if (signup?.token) {
            setShowOtp(signup.token);
            setIsSignUp(false);
          }
          setLoading(false);
        })
        .catch((err) => {
          setLoading(false);
          showError(friendlyError(err));
        });
    } else {
      showError(`Please enter your ${!fullName ? "name" : "password"}`);
    }
  };

  const handleVerifyOtp = async () => {
    if (otp.length !== 4) {
      showError("Please enter the 4-digit code");
      return;
    }
    setLoading(true);
    verifyOtp({
      variables: {
        params: {
          token: showOtp,
          otp,
        },
      },
    })
      .then((res: any) => {
        if (!resetMode) {
          localStorage.setItem("token", res.data.verifyOtp.token);
          // Keep the role too (Admin badge, admin menu and landing page depend on it)
          const otpRole = res.data.verifyOtp.type;
          if (otpRole) localStorage.setItem("role", otpRole);
          toast.success("Logged in successfully");
          navigate(otpRole === "ADMIN" ? "/overview" : "/");
        } else {
          setForgotPsw(res.data.verifyOtp.token);
          setShowOtp("");
          setPassword("");
        }
        setLoading(false);
      })
      .catch((err: any) => {
        setLoading(false);
        setOtp("");
        showError(friendlyError(err));
      });
  };

  const handleResetPassword = async () => {
    const problem = passwordProblem(password);
    if (problem) {
      showError(problem);
      return;
    }
    setLoading(true);
    resetPassword({
      variables: {
        password,
      },
      context: {
        headers: {
          Authorization: `Bearer ${forgotPsw}`,
        },
      },
    })
      .then(() => {
        localStorage.setItem("token", forgotPsw);
        toast.success("Password reset successfully");
        navigate("/");
      })
      .catch((e: any) => {
        setLoading(false);
        showError(friendlyError(e));
      });
  };

  const handleSubmit = () => {
    if (isSignup) handleSignup();
    else if (showOtp) handleVerifyOtp();
    else if (forgotPsw) handleResetPassword();
    else if (showPassword) handleLogin();
    else handleEmailSubmit();
  };

  const onKeyDownHandler = (e: any) => {
    if (e?.keyCode === 13) {
      e?.target?.blur();
      e?.preventDefault();
      handleSubmit();
    }
  };
  return (
    <PageLayout>
      <Grid container>
        {loading && <MDCircularLoader overlayloader startLoader />}
        <Grid item xs={12} lg={6}>
          <MDBox
            display={{ xs: "none", lg: "flex" }}
            alignItems="center"
            width="calc(100% - 2rem)"
            height="calc(100vh - 2rem)"
            borderRadius="lg"
            ml={2}
            mt={2}
          >
            <MDBox
              display={{ xs: "none", lg: "flex" }}
              alignItems="center"
              justifyContent="center"
              width="100%"
              height="calc(100vh - 2rem)"
              bgColor="white"
              sx={{ borderRadius: "16px" }}
            >
              <img src={OneWireLogo} alt="01 Wire" data-testid="signin-logo" style={{ width: "45%", maxWidth: "420px", height: "auto" }} />
            </MDBox>
          </MDBox>
        </Grid>
        <Grid item xs={11} sm={8} md={6} lg={4} xl={3} sx={{ mx: "auto" }}>
          <MDBox display="flex" flexDirection="column" justifyContent="center" height="100vh">
            <MDBox py={3} px={3} textAlign="center">
              <>
                <MDBox mb={1} textAlign="center">
                  <MDTypography variant="h4" fontWeight="bold">
                    {showOtp
                      ? "Confirmation Awaits!"
                      : forgotPsw
                      ? "Secure Access"
                      : `Welcome to ${brandName}`}
                  </MDTypography>
                </MDBox>

                <MDTypography variant="body2" color="text" fontWeight="regular">
                  {showOtp
                    ? `We've sent a 4-digit code to ${email}. Enter it below${resetMode ? " to set a new password" : ""}.`
                    : isSignup
                    ? "Let's get started!"
                    : forgotPsw
                    ? "Choose a new password: at least 8 characters, with a letter and a number."
                    : "Let's get you connected. Please enter your work email to begin."}
                </MDTypography>
              </>
            </MDBox>
            <MDBox p={3}>
              <MDBox component="form" role="form" onKeyDown={onKeyDownHandler}>
                {!(showOtp || forgotPsw) && (
                  <>
                    <MDTypography
                      sx={{ mb: "0.5rem" }}
                      fontSize="16px"
                      fontWeight="medium"
                      color="textSecondary"
                    >
                      Work Email
                    </MDTypography>
                    <MDBox mb={2}>
                      <MDInput
                        type="email"
                        fullWidth
                        disabled={isSignup || showPassword}
                        error={emailError !== ""}
                        value={email}
                        InputLabelProps={{
                          shrink: true,
                        }}
                        onChange={(e: any) => {
                          setEmail(e.target.value);
                          setEmailError("");
                        }}
                        InputProps={{
                          endAdornment: (
                            <InputAdornment position="start">
                              <EmailOutlinedIcon />
                            </InputAdornment>
                          ),
                        }}
                      />
                    </MDBox>
                    {isSignup && (
                      <MDBox mb={2}>
                        <MDTypography
                          sx={{ mb: "0.5rem" }}
                          fontSize="16px"
                          fontWeight="medium"
                          color="textSecondary"
                        >
                          Name
                        </MDTypography>
                        <MDInput
                          InputLabelProps={{
                            shrink: true,
                          }}
                          value={fullName}
                          onChange={(e: any) => setFullName(e.target.value)}
                          fullWidth
                          InputProps={{
                            endAdornment: (
                              <InputAdornment position="start">
                                <PersonOutlineIcon />
                              </InputAdornment>
                            ),
                          }}
                        />
                      </MDBox>
                    )}
                    {(isSignup || showPassword) && (
                      <MDBox mb={2}>
                        <MDTypography
                          sx={{ mb: "0.5rem" }}
                          fontSize="16px"
                          fontWeight="medium"
                          color="textSecondary"
                        >
                          Password
                        </MDTypography>
                        <MDInput
                          InputLabelProps={{
                            shrink: true,
                          }}
                          value={password}
                          onChange={(e: any) => setPassword(e.target.value)}
                          type="password"
                          fullWidth
                          InputProps={{
                            endAdornment: (
                              <InputAdornment position="start">
                                <LockOutlinedIcon />
                              </InputAdornment>
                            ),
                          }}
                        />
                      </MDBox>
                    )}
                  </>
                )}
                {!showOtp && forgotPsw && (
                  <MDBox mb={2}>
                    <MDTypography
                      sx={{ mb: "0.5rem" }}
                      fontSize="16px"
                      fontWeight="medium"
                      color="textSecondary"
                    >
                      New password
                    </MDTypography>
                    <MDInput
                      InputLabelProps={{
                        shrink: true,
                      }}
                      value={password}
                      onChange={(e: any) => setPassword(e.target.value)}
                      type="password"
                      fullWidth
                      InputProps={{
                        endAdornment: (
                          <InputAdornment position="start">
                            <LockOutlinedIcon />
                          </InputAdornment>
                        ),
                      }}
                    />
                  </MDBox>
                )}
                {showOtp && (
                  <MDBox mb={2}>
                    <MDTypography
                      sx={{ mb: "0.5rem" }}
                      fontSize="16px"
                      fontWeight="medium"
                      color="textSecondary"
                    >
                      Enter OTP
                    </MDTypography>
                    <MDBox display="flex" justifyContent="center">
                      <MuiOtpInput
                        value={otp}
                        onChange={(val) => setOtp(val)}
                        length={4}
                        autoFocus
                        validateChar={(character: string, index: number) => true}
                        sx={{
                          "& .MuiOtpInput-TextField input": {
                            width: "36px",
                            height: "36px",
                            bgcolor: "#fff",
                            padding: "4px",
                            borderRadius: "8px",
                          },
                        }}
                      />
                    </MDBox>
                  </MDBox>
                )}

                <MDBox mt={4}>
                  <MDButton onClick={handleSubmit} color="secondary" size="large" fullWidth>
                    {showOtp || showPassword || forgotPsw ? "Submit" : isSignup ? "Sign up" : "Next"}
                  </MDButton>
                </MDBox>
                {(showPassword || showOtp) && (
                  <MDBox mt={1} textAlign="left">
                    <MDTypography variant="button" color="secondary">
                      {showOtp ? "" : showPassword ? "" : "Don't have an account?"}
                      <MDTypography
                        component="button"
                        type="button"
                        data-testid={showOtp ? "resend-otp" : "forgot-password"}
                        onClick={() => {
                          if (showPassword || showOtp) handleForgotPassword(showOtp ? resetMode : true);
                        }}
                        variant="button"
                        color="primary"
                        fontWeight="medium"
                        textGradient
                        sx={{ ml: 1, border: 0, p: 0, cursor: "pointer" }}
                      >
                        {showOtp ? "Resend OTP?" : showPassword ? "Forgot Password?" : "Signup"}
                      </MDTypography>
                    </MDTypography>
                  </MDBox>
                )}
                {(showOtp || forgotPsw) && (
                  <MDBox mt={1} textAlign="left">
                    <MDTypography
                      component="button"
                      type="button"
                      data-testid="back-to-sign-in"
                      onClick={backToSignIn}
                      variant="button"
                      color="secondary"
                      fontWeight="medium"
                      sx={{ background: "none", border: 0, p: 0, cursor: "pointer" }}
                    >
                      Back to sign in
                    </MDTypography>
                  </MDBox>
                )}
              </MDBox>
            </MDBox>
          </MDBox>
        </Grid>
      </Grid>
    </PageLayout>
  );
}

export default SignIn;
