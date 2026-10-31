// Templates for other occasions reuse the wedding fields of InvitationData under different
// meanings (e.g. groomName holds the baby's name). This maps each such template to the labels
// the editor shows for those fields, so customers see what each field is for.

export interface FieldLabels {
  namesTitle: string;
  groomName: string;
  groomNamePlaceholder: string;
  brideName: string;
  brideNamePlaceholder: string;
  photos: { groomImage?: string; brideImage?: string; coupleImage: string }; // a missing key hides that photo
  detailsTitle: string;
  date: string;
  time: string;
  storyTitle: string;
  storyLabel: string;
  storyPlaceholder: string;
  family: { groomFatherName: string; groomMotherName: string; brideFatherName: string; brideMotherName: string };
}

export const WEDDING_LABELS: FieldLabels = {
  namesTitle: "Couple Details",
  groomName: "Groom Name",
  groomNamePlaceholder: "e.g. Arjun Kumar",
  brideName: "Bride Name",
  brideNamePlaceholder: "e.g. Divya Sharma",
  photos: { groomImage: "Groom Photo", brideImage: "Bride Photo", coupleImage: "Couple Photo" },
  detailsTitle: "Wedding Details",
  date: "Wedding Date",
  time: "Wedding Time",
  storyTitle: "Our Story",
  storyLabel: "How you met, the proposal, or anything you'd like to share",
  storyPlaceholder: "We met at a coffee shop in 2021…",
  family: { groomFatherName: "Groom's Father", groomMotherName: "Groom's Mother", brideFatherName: "Bride's Father", brideMotherName: "Bride's Mother" },
};

const BABY_LABELS: FieldLabels = {
  namesTitle: "Baby & Parents",
  groomName: "Baby's Name",
  groomNamePlaceholder: "e.g. Baby Aarav",
  brideName: "Parents' Names",
  brideNamePlaceholder: "e.g. Arjun & Priya",
  photos: { coupleImage: "Baby Photo" },
  detailsTitle: "Celebration Details",
  date: "Celebration Date",
  time: "Start Time",
  storyTitle: "Family Message",
  storyLabel: "A few words from the family (shown instead of the welcome message)",
  storyPlaceholder: "Our little one has filled our world with happiness…",
  family: {
    groomFatherName: "Grandfather (father's side)",
    groomMotherName: "Grandmother (father's side)",
    brideFatherName: "Grandfather (mother's side)",
    brideMotherName: "Grandmother (mother's side)",
  },
};

/** Templates whose fields mean baby / parents / grandparents instead of groom / bride. */
export const BABY_TEMPLATE_KEYS = new Set(["baby-bundle-of-joy"]);

export function fieldLabels(componentKey: string): FieldLabels {
  return BABY_TEMPLATE_KEYS.has(componentKey) ? BABY_LABELS : WEDDING_LABELS;
}
