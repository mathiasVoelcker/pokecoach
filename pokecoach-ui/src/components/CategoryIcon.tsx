import { Shield, Sparkles, Swords } from "lucide-react";

export const CategoryIcon = ({ category }: { category: string }) => {
    switch (category) {
    case "physical":
      return <Swords className="w-3 h-3" />;
    case "special":
      return <Sparkles className="w-3 h-3" />;
    default:
      return <Shield className="w-3 h-3" />;
  }
}