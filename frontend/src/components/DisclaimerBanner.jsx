import React from "react";
import { AlertCircle } from "lucide-react";

export default function DisclaimerBanner({ compact = false }) {
  if (compact) {
    return (
      <div className="disclaimer-banner compact">
        <AlertCircle size={15} className="disclaimer-icon" />
        <span>Educational demonstration only. Not medical or clinical nutrition advice.</span>
      </div>
    );
  }

  return (
    <div className="disclaimer-banner">
      <div className="disclaimer-header">
        <AlertCircle size={20} className="disclaimer-icon" />
        <h4>Coursework & Educational Wellness Notice</h4>
      </div>
      <p>
        This diet plan is generated as an academic and cloud computing demonstration. The outputs are calculated using general nutritional formulas and algorithmic heuristics. They do <strong>not</strong> substitute for licensed clinical nutrition therapy, medical diagnosis, or personalized dietary consultation.
      </p>
    </div>
  );
}
