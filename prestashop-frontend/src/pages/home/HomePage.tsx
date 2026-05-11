import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

export function HomePage() {
  const navigate = useNavigate();

  return <>
    <h1>Home Page</h1>

    <Button onClick={() => navigate("/backoffice/home")}>Go to Backoffice Home</Button>
  </>
}