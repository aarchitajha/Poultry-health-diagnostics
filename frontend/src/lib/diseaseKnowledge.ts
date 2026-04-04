/** Medically oriented reference copy — educational; not a substitute for veterinary diagnosis. */

export type DiseaseKey = "Coccidiosis" | "Healthy" | "Newcastle" | "Salmonella";

export const DISEASE_ORDER: DiseaseKey[] = ["Coccidiosis", "Healthy", "Newcastle", "Salmonella"];

export const diseaseImages: Record<DiseaseKey, string> = {
  Coccidiosis: "/static/disease_assets/coccidiosis.png",
  Healthy: "/static/disease_assets/healthy.png",
  Newcastle: "/static/disease_assets/newcastle.png",
  Salmonella: "/static/disease_assets/salmonella.png",
};

export type DiseaseDetail = {
  overview: string[];
  symptoms: string[];
  cause: string[];
  treatment: string[];
  prevention: string[];
  mortalityRisk: "low" | "moderate" | "high" | "critical";
  dangerStat: string;
  zoonotic: boolean;
  recommendedAction: string;
};

export const diseaseDetails: Record<DiseaseKey, DiseaseDetail> = {
  Coccidiosis: {
    overview: [
      "Intestinal coccidiosis is caused by Eimeria spp. protozoa and is among the most economically important diseases of commercial poultry.",
      "Oocysts are ingested from contaminated litter; damage to intestinal epithelium impairs nutrient absorption and can predispose birds to secondary complications.",
    ],
    symptoms: [
      "Ruffled feathers, huddling, and reduced feed intake.",
      "Diarrhea — may be watery or bloody depending on Eimeria species and severity.",
      "Growth depression and poorer feed conversion in subclinical infections.",
    ],
    cause: [
      "Ingestion of sporulated Eimeria oocysts from feces-contaminated litter, feed, equipment, or water.",
      "Warm, moist litter favors sporulation; stocking density and hygiene strongly influence infection pressure.",
    ],
    treatment: [
      "Anticoccidials (ionophores or synthetic drugs) used according to label and veterinary guidance where prescription products apply.",
      "Supportive care: warmth, electrolytes, and ensuring water intake during clinical breaks.",
      "Rotate active ingredients responsibly to limit selection for drug resistance.",
    ],
    prevention: [
      "Manage litter moisture and ventilation; avoid overcrowding.",
      "Use structured anticoccidial or vaccination programs suited to your production system.",
    ],
    mortalityRisk: "high",
    dangerStat: "Subclinical coccidiosis can substantially reduce weight gain and uniformity in broilers.",
    zoonotic: false,
    recommendedAction:
      "Confirm with fecal oocyst monitoring or necropsy; adjust anticoccidial rotation and litter management with your veterinarian.",
  },
  Healthy: {
    overview: [
      "This class represents birds without signs attributed to the three target diseases in the training taxonomy.",
      "Any classifier can mislabel edge cases; correlate with flock behavior, production metrics, and lab testing when decisions are high-stakes.",
    ],
    symptoms: [
      "Alert posture, even feathering, and normal feeding and drinking behavior.",
      "Stable egg production in layers within breed and age expectations.",
      "No persistent respiratory noise, neurologic signs, or unusual mortality pattern.",
    ],
    cause: [
      "Not a disease — a baseline category for contrast in supervised image datasets.",
      "Good biosecurity, nutrition, vaccination, and housing reduce the chance that early disease is mistaken for health.",
    ],
    treatment: [
      "No treatment is indicated solely because the model predicts “Healthy.”",
      "Maintain routine husbandry, vaccination schedules, and monitoring protocols.",
    ],
    prevention: [
      "Continue biosecurity, pest control, and appropriate stocking density.",
      "Capture reference images under consistent lighting to improve model reliability over time.",
    ],
    mortalityRisk: "low",
    dangerStat: "False reassurance remains possible — always integrate clinical and production data.",
    zoonotic: false,
    recommendedAction: "Continue routine monitoring; investigate if production drops or mortality exceeds flock baseline.",
  },
  Newcastle: {
    overview: [
      "Newcastle disease (ND) is caused by avian paramyxovirus serotype 1 (APMV-1); strains range from low-virulence to highly virulent.",
      "Respiratory and digestive signs are common; velogenic strains may cause severe neurologic disease and high mortality.",
    ],
    symptoms: [
      "Respiratory distress, nasal discharge, and reduced egg production or shell quality.",
      "Greenish diarrhea and sudden mortality spikes in virulent field strains.",
      "Twisted neck, circling, tremors, or paralysis in nervous presentations.",
    ],
    cause: [
      "Virus spread by direct contact, contaminated equipment, people, and potentially some wild bird interfaces depending on region and biosecurity.",
    ],
    treatment: [
      "No specific antiviral cure; control combines biosecurity, vaccination policy, and regulatory measures where ND is notifiable.",
      "Supportive care may be limited or prohibited during official outbreak response — follow jurisdictional guidance.",
    ],
    prevention: [
      "Implement rigorous farm entry protocols and line separation.",
      "Maintain vaccination schedules appropriate to risk and product registration in your region.",
    ],
    mortalityRisk: "critical",
    dangerStat: "Highly virulent ND can approach 100% mortality in naive, unvaccinated flocks.",
    zoonotic: false,
    recommendedAction:
      "Isolate suspect cases; notify official veterinary services if reporting applies; review vaccination coverage and movement controls immediately.",
  },
  Salmonella: {
    overview: [
      "Non-typhoidal Salmonella spp. colonize the poultry gut and are a major food-safety concern for eggs and meat.",
      "Birds may appear normal while intermittently shedding organisms into the environment.",
    ],
    symptoms: [
      "Often asymptomatic carriers in adults; young birds may show pasty vent, stunting, or elevated early mortality with heavy challenge.",
    ],
    cause: [
      "Transmission via vertically infected chicks, contaminated environment, feed or water, rodents, insects, or equipment.",
    ],
    treatment: [
      "Antimicrobial options are increasingly restricted; many programs emphasize hygiene, competitive exclusion products, and replacement strategies per veterinary advice.",
    ],
    prevention: [
      "Rodent and insect control, clean water lines, and verified feed sources.",
      "Worker hygiene and egg handling practices that align with public-health guidance.",
    ],
    mortalityRisk: "moderate",
    dangerStat: "Salmonella can survive for extended periods in litter and dust when conditions allow.",
    zoonotic: true,
    recommendedAction:
      "Strengthen biosecurity and environmental sampling; align with veterinary and public-health testing programs for your market.",
  },
};

export function normalizePrediction(p: string): DiseaseKey | null {
  if (p in diseaseDetails) return p as DiseaseKey;
  return null;
}
