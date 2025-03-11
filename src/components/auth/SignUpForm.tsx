
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { toast } from "sonner";
import { Eye, EyeOff, Loader2 } from "lucide-react";

export function SignUpForm() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    role: "Mentor"
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleRoleChange = (value: string) => {
    setFormData(prev => ({ ...prev, role: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Success toast notification
    toast.success("Account created successfully!");
    
    // Navigate to the dashboard
    navigate("/dashboard");
  };

  const togglePasswordVisibility = () => {
    setShowPassword(prev => !prev);
  };

  return (
    <motion.form 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.2 }}
      onSubmit={handleSubmit}
      className="space-y-4"
    >
      <div className="space-y-2">
        <Label htmlFor="email" className="text-sm font-medium">
          Email
        </Label>
        <Input
          id="email"
          name="email"
          type="email"
          placeholder="you@example.com"
          autoComplete="email"
          required
          className="w-full border-gold-100 focus-within:border-gold-300 transition-all"
          value={formData.email}
          onChange={handleChange}
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="password" className="text-sm font-medium">
          Password
        </Label>
        <div className="relative">
          <Input
            id="password"
            name="password"
            type={showPassword ? "text" : "password"}
            placeholder="••••••••"
            autoComplete="new-password"
            required
            className="w-full border-gold-100 focus-within:border-gold-300 transition-all pr-10"
            value={formData.password}
            onChange={handleChange}
          />
          <button
            type="button"
            onClick={togglePasswordVisibility}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition"
          >
            {showPassword ? (
              <EyeOff size={18} />
            ) : (
              <Eye size={18} />
            )}
          </button>
        </div>
      </div>
      
      <div className="space-y-2">
        <Label className="text-sm font-medium">
          Select Role
        </Label>
        <RadioGroup 
          defaultValue="Mentor" 
          className="flex space-x-2"
          value={formData.role}
          onValueChange={handleRoleChange}
        >
          <div className="flex items-center space-x-1">
            <RadioGroupItem value="Admin" id="admin" className="border-gold-200 text-gold-500" />
            <Label htmlFor="admin" className="text-sm">Admin</Label>
          </div>
          <div className="flex items-center space-x-1">
            <RadioGroupItem value="Mentor" id="mentor" className="border-gold-200 text-gold-500" />
            <Label htmlFor="mentor" className="text-sm">Mentor</Label>
          </div>
          <div className="flex items-center space-x-1">
            <RadioGroupItem value="Sales" id="sales" className="border-gold-200 text-gold-500" />
            <Label htmlFor="sales" className="text-sm">Sales</Label>
          </div>
        </RadioGroup>
      </div>
      
      <Button
        type="submit"
        className="w-full bg-gold-500 hover:bg-gold-600 text-white font-medium"
        disabled={isLoading}
      >
        {isLoading ? (
          <>
            <Loader2 size={16} className="animate-spin mr-2" />
            Creating Account...
          </>
        ) : (
          "Create Account"
        )}
      </Button>
      
      <p className="text-center text-xs text-muted-foreground mt-4">
        By signing up, you agree to our Terms of Service and Privacy Policy.
      </p>
    </motion.form>
  );
}
