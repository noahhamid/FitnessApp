import { LegalDocumentScreen } from "@/src/features/legal/LegalDocumentScreen";
import { PRIVACY_POLICY } from "@/src/features/legal/legal-content";

export default function PrivacyPolicyRoute() {
  return <LegalDocumentScreen document={PRIVACY_POLICY} />;
}
