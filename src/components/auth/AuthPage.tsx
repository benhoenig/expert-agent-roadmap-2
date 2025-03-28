import { SignInForm } from "./SignInForm";
import { motion } from "framer-motion";

export function AuthPage() {
  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 bg-white">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="w-full max-w-md"
      >
        <div className="relative overflow-hidden bg-white rounded-2xl shadow-xl border border-gray-100">
          {/* Decorative elements */}
          <div className="absolute -top-16 -right-16 w-32 h-32 rounded-full bg-gold-200/50 blur-3xl" />
          <div className="absolute -bottom-16 -left-16 w-32 h-32 rounded-full bg-gold-100/50 blur-2xl" />
          
          <div className="relative p-8 backdrop-blur-sm">
            {/* Logo/Branding */}
            <div className="text-center mb-6">
              <h1 className="text-2xl font-semibold tracking-tight mb-1">
                <span className="text-gradient">Expert Agent Roadmap</span>
              </h1>
              <p className="text-sm text-muted-foreground">
                Sign in to access your account
              </p>
            </div>
            
            {/* Sign In Form */}
            <SignInForm />
          </div>
        </div>
      </motion.div>
    </div>
  );
}
