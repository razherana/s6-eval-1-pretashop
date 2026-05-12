import { AlertCircle } from "lucide-react";
import { Alert, AlertTitle, AlertDescription } from "../ui/alert";
import { Spinner } from "../ui/spinner";

export function FrontofficeDataLoadingComponent() {
  return (
    <div className="container mx-auto px-4 py-8">
      <Alert variant="default">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle> Loading...</AlertTitle>
        <AlertDescription className='flex gap-3 items-center'>
          <Spinner />
          Loading frontoffice data. Please wait.</AlertDescription>
      </Alert>
    </div>
  )
}