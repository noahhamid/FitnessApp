import { LegalDocumentScreen } from "@/src/features/legal/LegalDocumentScreen";
import { TERMS_OF_SERVICE } from "@/src/features/legal/legal-content";

export default function AuthTermsOfServiceRoute() {
  return <LegalDocumentScreen document={TERMS_OF_SERVICE} />;
}
