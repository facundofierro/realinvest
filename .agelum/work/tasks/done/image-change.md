---
created: 2026-10-03T07:48:15.801Z
status: done
summary: .agelum/work/summaries/2026-10-03-image-change-1791014160588.md
type: task
workflowStatus: done
---

# image change

The image of the card for "Marketing, CRM y agentes de IA" does not match the style of the other 2 service cards (the other two are photo-realistic: a team with a building model, and a 3D render of a residential tower). The CRM one is an illustration of leads moving through a sales funnel. Replace it with a photo-realistic image.

## Proposed options (photo-realistic style, 960x640, webp)

1. **Sales team on a call with a client**: a real estate sales advisor at a bright modern desk, headset on, with a laptop showing a chat/contact list (blurred UI) and a building model in the background.
2. **Hands on a smartphone with WhatsApp-style conversations**: close-up of a person's hands holding a phone with chat bubbles, shallow depth of field, a laptop with a lead pipeline softly out of focus behind.
3. **Marketing team around a dashboard screen**: 2-3 people in a modern office reviewing a large monitor with campaign metrics and lead charts (abstract, no legible text), natural window light.
4. **Buyers visiting a showroom, advisor tablet in hand**: a sales advisor with a tablet greeting a couple in a real estate showroom with a scale model, representing the handoff from AI qualification to the human team.
5. **Human + AI assistant concept**: a salesperson at a laptop with a subtle, realistic glowing chat-assistant interface on screen, a coffee and notebook on the desk, warm tones; AI conveyed through the screen only (no robots/sci-fi).
6. **Content creation for campaigns**: a marketer photographing/filming a building render or apartment interior for social media, with a tripod, ring light and a laptop with a content calendar (blurred) nearby.

Common prompt guidance: photorealistic photography, natural lighting, shallow depth of field, same color grading/warm purple-neutral palette as `service-setup.webp` and `service-3d.webp`, same 3:2 ratio, no legible text or logos, no illustration/vector look.

## Related source code

- `apps/landing/src/components/sections/services.tsx:6-22` - `images` map (src + alt per card key); `crm` entry at lines 18-21 (alt text also describes an illustration and must be updated)
- `apps/landing/src/components/sections/services.tsx:34-52` - card render with `<Image>` (960x640, `rounded-2xl`)
- `apps/landing/src/content/es.ts:249-272` - `services` content; CRM card at lines 263-267 (`key: "crm"`, title "Marketing, CRM y agentes de IA")
- `apps/landing/public/images/service-crm.webp` - the image to replace
- `apps/landing/public/images/service-setup.webp` - style reference (card 1)
- `apps/landing/public/images/service-3d.webp` - style reference (card 2)
- `apps/landing/src/content/es.ts:370` and `apps/landing/src/lib/demo-request-schema.ts:10` - other uses of the same service name (not image related, no change needed)