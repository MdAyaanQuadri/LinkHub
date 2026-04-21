import { signupSchema, loginSchema } from "../Validation/auth.validation.js";
import { loginUser, signupUser } from "../Services/auth.service.js";

const formatZodErrors = (error) =>
  error.issues.map((e) => ({
    field: e.path[0],
    message: e.message,
  }));

// ─── Sign Up ────────────────────────────────────────────────────────────────

export const signup = async (req, res) => {
  try {
    // 1. Validate request body with Zod
    const parsed = signupSchema.safeParse(req.body);

    if (!parsed.success) {
      return res.status(400).json({ success: false, errors: formatZodErrors(parsed.error) });
    }

    const result = await signupUser(parsed.data);
    return res.status(201).json(result);
  } catch (error) {
    console.error("[signup]", error);
    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.statusCode ? error.message : "Internal server error",
    });
  }
};

// ─── Login ───────────────────────────────────────────────────────────────────

export const login = async (req, res) => {
  try {
    // 1. Validate request body with Zod
    const parsed = loginSchema.safeParse(req.body);

    if (!parsed.success) {
      return res.status(400).json({ success: false, errors: formatZodErrors(parsed.error) });
    }

    const result = await loginUser(parsed.data);
    return res.status(200).json(result);
  } catch (error) {
    console.error("[login]", error);
    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.statusCode ? error.message : "Internal server error",
    });
  }
};
