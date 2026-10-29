# -*- coding: utf-8 -*-
"""
AgriVision AI — Simplified Integrated Pest Management (IPM) Guidance
Provides simple English, actionable, and pest-specific management advice
referenced from ICAR and TNAU agricultural extension frameworks.
Avoids complicated terminology, chemical dosages, and unsupported spray schedules.
"""

from __future__ import annotations

from typing import Any, Dict, List, Optional
from app.data.pest_catalog import IP102_CLASSES, get_pest_by_name

# Curated simple-English IPM guidance for prominent agricultural pests
CURATED_PEST_MANAGEMENT: Dict[str, Dict[str, Any]] = {
    "rice leaf roller": {
        "scientific_name": "Cnaphalocrocis medinalis (Guenée)",
        "crops_affected": ["Rice / Paddy", "Wheat", "Maize", "Sugarcane"],
        "description": "A green caterpillar that folds rice leaves with white silk threads and feeds inside the protective tube.",
        "symptoms": "Look for leaves rolled or folded lengthwise with pale, papery white streaks where the green leaf surface was scraped.",
        "life_cycle": "Moths lay flat eggs on leaf undersides. Caterpillars feed inside folded leaves for 2 to 3 weeks before turning into moths.",
        "ipm_recommendations": {
            "monitoring": (
                "Walk through your rice field once a week.\n"
                "Check both sides of leaves for white scraping marks and silk rolls.\n"
                "Count how many leaves are folded per plant.\n"
                "Do not spray pesticides just because a few folded leaves are visible."
            ),
            "cultural_mechanical": (
                "Avoid using too much nitrogen fertilizer, which makes leaves overly soft and attractive to caterpillars.\n"
                "Keep field bunds and borders free of wild grasses where moths hide.\n"
                "Hand-pick and remove folded leaves in small plots early in the season.\n"
                "Drain standing water occasionally to keep plant bases aerated."
            ),
            "biological": (
                "Protect helpful field hunters like wolf spiders and dragonflies that catch moths.\n"
                "Consider releasing tiny helpful Trichogramma wasps that stop pest eggs from hatching.\n"
                "Use eco-friendly neem seed extract sprays before trying any chemical products.\n"
                "Remember that spiders can eat several pest caterpillars every day."
            ),
            "chemical": (
                "First check if damage is truly serious (more than 1 or 2 folded leaves on most plants).\n"
                "Prefer non-chemical controls whenever possible.\n"
                "If pesticide treatment is necessary, choose an officially approved product for rice leaf rollers.\n"
                "Follow product label directions and advice from your local agricultural extension office."
            ),
        },
        "prevention_monitoring": "Choose resilient local rice varieties where available and inspect tillering plants weekly.",
        "when_to_consult_expert": "Consult an agricultural officer if leaf damage spreads to the top flag leaf during flowering or if damage continues after biological treatment.",
        "source": "ICAR - National Rice Research Institute (NRRI) & TNAU Agritech Portal",
    },
    "brown plant hopper": {
        "scientific_name": "Nilaparvata lugens (Stål)",
        "crops_affected": ["Rice / Paddy"],
        "description": "A tiny brown sap-sucking insect that gathers in large groups at the base of rice stems.",
        "symptoms": "Circular patches of rapidly yellowing and drying plants ('hopperburn'), sticky liquid on lower stems, and black mold on foliage.",
        "life_cycle": "Hoppers insert eggs into leaf sheaths. Young nymphs feed at the stem base and can multiply rapidly in dense, humid fields.",
        "ipm_recommendations": {
            "monitoring": (
                "Gently part the rice canopy and inspect the lower stems near the water line.\n"
                "Check for circular patches of drying plants ('hopperburn') and sticky honeydew.\n"
                "Count hoppers across 10 to 20 hills in different parts of the field.\n"
                "Do not spray broad-spectrum chemicals; this can kill predators and cause hoppers to multiply faster."
            ),
            "cultural_mechanical": (
                "Practice Alternate Wetting and Drying (AWD) so soil dries out periodically, reducing humidity.\n"
                "Leave 30 cm pathways ('skip rows') every 2 to 3 meters for better sunlight and airflow.\n"
                "Avoid applying excess nitrogen fertilizer, which fuels hopper population explosions.\n"
                "Keep field borders clean of wild grasses."
            ),
            "biological": (
                "Protect helpful hunters like wolf spiders, mirid bugs, and water striders.\n"
                "Beneficial mirid bugs and spiders naturally feed on hopper eggs and young nymphs.\n"
                "Avoid harsh chemical sprays that wipe out these natural defenders.\n"
                "Encourage natural farm biodiversity to keep hopper numbers in check."
            ),
            "chemical": (
                "Check if hopper numbers are high enough to cause spreading yellow patches before treating.\n"
                "Use only selective products officially recommended for brown planthoppers in rice.\n"
                "Target sprays directly at the lower base of the plants, not just the upper canopy.\n"
                "Strictly avoid synthetic pyrethroids, which cause dangerous hopper resurgence."
            ),
        },
        "prevention_monitoring": "Plant resistant or tolerant rice varieties and scout stem bases weekly from tillering onward.",
        "when_to_consult_expert": "Contact an agricultural extension officer immediately if circular hopperburn patches start expanding rapidly.",
        "source": "ICAR - Directorate of Rice Research (DRR) & TNAU Plant Protection Guidelines",
    },
    "asiatic rice borer": {
        "scientific_name": "Chilo suppressalis (Walker)",
        "crops_affected": ["Rice / Paddy", "Wild rice grasses"],
        "description": "A cream-colored caterpillar that bores into rice stems, blocking food and water transport.",
        "symptoms": "Look for 'dead hearts' (central young shoot dries brown and pulls out easily) or 'whiteheads' (pale, empty flower heads with no grain).",
        "life_cycle": "Moths lay egg clusters on leaves. Larvae bore into internodes and feed inside the stem straw before turning into moths.",
        "ipm_recommendations": {
            "monitoring": (
                "Check plants weekly for drying central shoots ('dead hearts') during early growth.\n"
                "Look for pale, upright empty heads ('whiteheads') as the crop flowers.\n"
                "Inspect stems for tiny entry holes and sawdust-like droppings.\n"
                "Do not spray pesticides just because a few dead shoots appear."
            ),
            "cultural_mechanical": (
                "Clip the top 2 cm of rice seedling leaves before transplanting to remove hidden egg clusters.\n"
                "Cut crop stubbles close to the ground at harvest time to destroy hiding caterpillars.\n"
                "Plough and flood the field after harvest to expose overwintering borers to birds.\n"
                "Synchronize planting times with neighboring farmers when possible."
            ),
            "biological": (
                "Protect helpful field spiders and parasitic wasps that destroy borer eggs.\n"
                "Install T-shaped bird perches in the field to encourage predatory birds to hunt moths.\n"
                "Consider releasing beneficial Trichogramma egg parasitoid wasps early in the season.\n"
                "Use botanical sprays like neem oil when young larvae are hatching."
            ),
            "chemical": (
                "Only treat if dead hearts appear on more than 1 in 20 plants across the field.\n"
                "Choose an officially approved borer product recommended by your local extension office.\n"
                "Apply treatments before caterpillars tunnel deep inside the tough stem.\n"
                "Always follow the approved label instructions and wear protective clothing."
            ),
        },
        "prevention_monitoring": "Destroy old crop stubbles and monitor vegetative tillers weekly.",
        "when_to_consult_expert": "Consult your local agricultural office if whitehead incidence exceeds 2% during panicle emergence.",
        "source": "ICAR - Indian Agricultural Research Institute (IARI) & TNAU",
    },
    "yellow rice borer": {
        "scientific_name": "Scirpophaga incertulas (Walker)",
        "crops_affected": ["Rice / Paddy"],
        "description": "The yellow stem borer is a caterpillar that lives entirely inside rice tillers, causing dead stems.",
        "symptoms": "Drying central shoots ('dead hearts') in young crops and bleached empty grain heads ('whiteheads') at harvest.",
        "life_cycle": "Moths lay velvety brownish egg masses near leaf tips. Caterpillars bore inside the stem and pupate at the plant base.",
        "ipm_recommendations": {
            "monitoring": (
                "Look for velvety brownish egg clusters near the tips of young rice leaves.\n"
                "Check for drying central shoots that pull out easily without resistance.\n"
                "Count how many plants show dead hearts in different spots.\n"
                "Act only when damage is clearly spreading."
            ),
            "cultural_mechanical": (
                "Clip off seedling leaf tips before transplanting to discard borer egg clusters.\n"
                "Harvest the crop at ground level and plough stubbles into the soil.\n"
                "Maintain balanced fertilizer use; avoid excessive nitrogen that softens stems.\n"
                "Clear wild grassy weeds from irrigation canals."
            ),
            "biological": (
                "Protect natural egg parasitoid wasps and ground beetles in the paddy.\n"
                "Erect bamboo bird perches across the field to attract insect-eating birds.\n"
                "Conserve native spiders that prey on adult yellow borer moths.\n"
                "Use neem-based bio-pesticides on young plants."
            ),
            "chemical": (
                "Check if damage crosses economic thresholds before deciding to spray.\n"
                "Use only officially recommended products approved for rice stem borers.\n"
                "Follow product label safety instructions carefully.\n"
                "Seek guidance from your nearest agricultural extension worker."
            ),
        },
        "prevention_monitoring": "Clip seedling tips and scout for egg masses weekly from transplanting.",
        "when_to_consult_expert": "Ask an agricultural officer if whiteheads appear during flowering despite preventive measures.",
        "source": "ICAR - NRRI Cuttack & TNAU Agritech",
    },
    "army worm": {
        "scientific_name": "Spodoptera litura (Fabricius)",
        "crops_affected": ["Cotton", "Soybean", "Maize", "Tomato", "Chili", "Cabbage", "Groundnut"],
        "description": "A voracious night-feeding caterpillar that chews leaves into ragged holes and hides in the soil during daylight.",
        "symptoms": "Leaves chewed into skeleton-like lace, ragged missing foliage, chewed growing tips, and dark droppings on ground.",
        "life_cycle": "Moths lay velvety egg clusters covered in golden scales on leaf undersides. Caterpillars feed at night and pupate in the soil.",
        "ipm_recommendations": {
            "monitoring": (
                "Inspect crops early in the morning or at dusk when caterpillars are actively feeding.\n"
                "Check the undersides of leaves for hairy egg masses and clusters of tiny caterpillars.\n"
                "Count damaged plants across several rows to determine if damage is localized.\n"
                "Do not spray if only a few leaves have minor chew marks."
            ),
            "cultural_mechanical": (
                "Hand-pick and safely destroy egg clusters and groups of young caterpillars.\n"
                "Plough fields deeply during summer to expose hidden pupae to sunlight and birds.\n"
                "Plant border rows of castor or sunflower as trap crops to draw caterpillars away from your main crop.\n"
                "Keep field borders clear of broadleaf weeds."
            ),
            "biological": (
                "Encourage natural insect-eating birds by placing T-poles in the field.\n"
                "Protect beneficial parasitoid wasps and ground beetles that hunt caterpillars.\n"
                "Use biological sprays like neem oil or Bacillus thuringiensis (Bt) while caterpillars are small.\n"
                "Avoid broad-spectrum chemical sprays that wipe out natural predators."
            ),
            "chemical": (
                "First verify if defoliation is severe enough to harm the harvest.\n"
                "Treat while caterpillars are young and small; large mature caterpillars are harder to control.\n"
                "Use only officially approved products registered for caterpillar control on your specific crop.\n"
                "Strictly follow safety guidelines, pre-harvest waiting periods, and label directions."
            ),
        },
        "prevention_monitoring": "Maintain trap crop borders and inspect leaf undersides for egg masses weekly.",
        "when_to_consult_expert": "Consult an agricultural expert if large caterpillars resist biological controls or continue defoliating crops.",
        "source": "ICAR - National Bureau of Agricultural Insect Resources (NBAIR) & TNAU",
    },
    "cabbage army worm": {
        "scientific_name": "Mamestra brassicae (Linnaeus)",
        "crops_affected": ["Cabbage", "Cauliflower", "Broccoli", "Canola", "Beet"],
        "description": "A caterpillar that feeds heavily on brassica leaves and burrows deep into cabbage heads.",
        "symptoms": "Ragged holes chewed into leaves and dark moist droppings inside developing cabbage or cauliflower heads.",
        "life_cycle": "Eggs laid in batches on leaf undersides. Caterpillars feed on foliage then burrow into head hearts to pupate.",
        "ipm_recommendations": {
            "monitoring": (
                "Check 20 to 30 cabbage plants weekly for leaf holes and egg clusters.\n"
                "Inspect the underside of lower leaves where moths lay eggs.\n"
                "Look inside the heart leaves of young cabbage heads.\n"
                "Take action before caterpillars bore inside the head."
            ),
            "cultural_mechanical": (
                "Hand-pick and crush egg batches and young caterpillars.\n"
                "Cover young seedling beds with fine insect netting until heads form.\n"
                "Intercrop with aromatic herbs like mint or dill to deter egg-laying moths.\n"
                "Plough and clear old brassica crop debris immediately after harvest."
            ),
            "biological": (
                "Protect helpful parasitic wasps and predatory beetles.\n"
                "Apply biological sprays like Bacillus thuringiensis (Bt) or neem oil on young caterpillars.\n"
                "Encourage garden birds around the farm.\n"
                "Avoid harsh chemicals that eliminate natural beneficial insects."
            ),
            "chemical": (
                "Only treat if caterpillar feeding is threatening young cabbage heads.\n"
                "Apply treatments before caterpillars bore inside the head, where sprays cannot reach.\n"
                "Use an approved brassica caterpillar product recommended by your local extension service.\n"
                "Observe the required waiting days before harvesting."
            ),
        },
        "prevention_monitoring": "Use fine netting over seedlings and scout developing heads weekly.",
        "when_to_consult_expert": "Ask an extension specialist if caterpillars penetrate deep into the core head where sprays cannot reach.",
        "source": "ICAR - Indian Institute of Horticultural Research (IIHR)",
    },
    "beet army worm": {
        "scientific_name": "Spodoptera exigua (Hübner)",
        "crops_affected": ["Sugarbeet", "Cotton", "Tomato", "Onion", "Pepper", "Corn"],
        "description": "A small green or brownish caterpillar that feeds on leaves, flowers, and developing fruit.",
        "symptoms": "Windowpane-like thin feeding marks on leaves, chewed flower buds, and small holes in fruit.",
        "life_cycle": "Eggs laid under cottony white scales. Caterpillars feed for 2 to 3 weeks before pupating in topsoil.",
        "ipm_recommendations": {
            "monitoring": (
                "Look for 'windowpane' thin patches on leaves where young caterpillars scraped the surface.\n"
                "Check flower buds and young fruit for small chewed holes.\n"
                "Count how many plants show fresh feeding damage.\n"
                "Do not spray if damage is minor and contained."
            ),
            "cultural_mechanical": (
                "Remove and destroy weed hosts like wild pigweed (Amaranthus) from field borders.\n"
                "Plough fields thoroughly after harvest to expose pupae in the soil.\n"
                "Hand-remove initial egg masses and clustered young larvae.\n"
                "Keep crop rows properly spaced for good air circulation."
            ),
            "biological": (
                "Protect natural predatory bugs, spiders, and parasitic wasps.\n"
                "Apply biological sprays such as neem oil or Bt while caterpillars are small.\n"
                "Preserve natural farm biodiversity.\n"
                "Avoid repeated broad-spectrum sprays that breed resistant caterpillars."
            ),
            "chemical": (
                "Only treat if fresh damage is actively spreading to new shoots or fruit.\n"
                "Rotate between different approved product groups to prevent chemical resistance.\n"
                "Always read the product label and wear protective equipment.\n"
                "Consult your local agricultural office for recommended options."
            ),
        },
        "prevention_monitoring": "Clear border weeds and inspect developing shoots weekly.",
        "when_to_consult_expert": "Consult an extension specialist if caterpillars continue feeding after initial treatment.",
        "source": "ICAR - NBAIR & TNAU Crop Protection",
    },
    "aphids": {
        "scientific_name": "Aphis gossypii (Glover) / Aphis craccivora (Koch)",
        "crops_affected": ["Cotton", "Wheat", "Mustard", "Vegetables", "Citrus", "Pulses"],
        "description": "Small, soft-bodied green or black sap-sucking insects that multiply rapidly in dense clusters.",
        "symptoms": "Curling and crinkling of young leaves, sticky clear dew on foliage, and black sooty mold fungus.",
        "life_cycle": "Female aphids give birth to live young without mating. Colonies can double in size in just a few warm days.",
        "ipm_recommendations": {
            "monitoring": (
                "Inspect the undersides of leaves and tender growing tips once or twice a week.\n"
                "Look for curled leaves, sticky honeydew, or black sooty mold.\n"
                "Check if helpful ladybird beetles or hoverfly maggots are already feeding on the aphids.\n"
                "Do not spray if ladybugs and other predators are keeping the colony small."
            ),
            "cultural_mechanical": (
                "Avoid applying excess nitrogen fertilizer, which produces overly soft, sap-rich growth that aphids love.\n"
                "Prune off or wash away isolated aphid colonies with a strong water spray on small plots.\n"
                "Grow border rows of tall crops like maize or sorghum to catch windblown flying aphids.\n"
                "Keep fields free of broadleaf weeds."
            ),
            "biological": (
                "Protect helpful ladybird beetles, lacewing larvae, and hoverfly maggots that consume aphids.\n"
                "A single ladybug can eat hundreds of aphids over its lifetime.\n"
                "Spray botanical neem seed extract (neem oil) at the first sign of colonies.\n"
                "Avoid harsh broad-spectrum sprays that kill beneficial ladybugs."
            ),
            "chemical": (
                "Only treat if aphid colonies are spreading across a large percentage of your crop.\n"
                "Choose a selective, approved product that spares beneficial ladybugs when possible.\n"
                "Spot-spray only the heavily infested patches rather than the entire field.\n"
                "Follow product label directions and local extension guidelines."
            ),
        },
        "prevention_monitoring": "Monitor tender new shoots and leaf undersides weekly during warm dry weather.",
        "when_to_consult_expert": "Consult an extension officer if yellowing is accompanied by severe mosaic viral symptoms or persistent aphid resistance.",
        "source": "ICAR - Directorate of Rapeseed-Mustard Research & TNAU",
    },
    "english grain aphid": {
        "scientific_name": "Sitobion avenae (Fabricius)",
        "crops_affected": ["Wheat", "Barley", "Oats"],
        "description": "A green or reddish-brown aphid that moves from cereal leaves directly into developing grain heads.",
        "symptoms": "Yellowing leaves, shriveled lightweight grain kernels, and sticky honeydew on wheat heads.",
        "life_cycle": "Aphids feed on wheat leaves during vegetative growth, then cluster on flower heads during grain filling.",
        "ipm_recommendations": {
            "monitoring": (
                "Inspect wheat heads weekly from flowering to the milky grain stage.\n"
                "Count aphids on 20 earheads across different parts of the field.\n"
                "Check whether ladybird beetles and parasitic wasps are present.\n"
                "Do not spray if only a few scattered aphids are found."
            ),
            "cultural_mechanical": (
                "Plant wheat at the recommended local sowing date to reduce overlapping with peak aphid flights.\n"
                "Use balanced fertilizers; avoid excess nitrogen.\n"
                "Maintain clean field borders free of wild grasses.\n"
                "Ensure proper field drainage."
            ),
            "biological": (
                "Protect native ladybird beetles, lacewings, and tiny parasitic wasps in cereal fields.\n"
                "Conserve natural grassy field edges that harbor beneficial insects.\n"
                "Consider botanical neem sprays early in the season.\n"
                "Avoid broad-spectrum chemical sprays that wipe out natural enemies."
            ),
            "chemical": (
                "Only consider treating if aphid numbers are high during flowering before grain hardens.\n"
                "Once grains reach the hard dough stage, aphid feeding causes minimal yield loss.\n"
                "Use only officially approved products registered for wheat aphids.\n"
                "Observe strict harvest waiting periods."
            ),
        },
        "prevention_monitoring": "Check flag leaves and developing earheads weekly from boot stage.",
        "when_to_consult_expert": "Ask an agricultural expert if grain heads show heavy clusters before the milky grain stage.",
        "source": "ICAR - Indian Institute of Wheat and Barley Research (IIWBR)",
    },
    "red spider": {
        "scientific_name": "Tetranychus urticae (Koch)",
        "crops_affected": ["Tomato", "Chili", "Brinjal / Eggplant", "Cotton", "Tea", "Okra", "Roses"],
        "description": "A microscopic red or pale mite that feeds on the undersides of leaves and spins delicate silk webbing.",
        "symptoms": "Tiny pale yellow or white speckles on leaves, foliage turning bronze or dry, and fine webbing on leaf undersides.",
        "life_cycle": "Mites multiply very quickly in hot, dry weather. A new generation can emerge in just 7 to 10 days.",
        "ipm_recommendations": {
            "monitoring": (
                "Use a hand magnifying lens to check the undersides of leaves during hot, dry spells.\n"
                "Look for fine white speckles, dusty leaves, and delicate silk webbing.\n"
                "Check lower leaves first where mites usually start.\n"
                "Do not spray chemicals if only a few leaves have speckles."
            ),
            "cultural_mechanical": (
                "Keep crops properly watered; water-stressed, dusty crops suffer much worse mite damage.\n"
                "Use overhead sprinkler washing where feasible to knock mites off foliage and destroy webbing.\n"
                "Remove and safely dispose of wild solanaceous weeds around the plot.\n"
                "Avoid creating dusty roads or pathways right next to vulnerable crops."
            ),
            "biological": (
                "Protect helpful predatory mites and tiny black ladybird beetles that eat spider mites.\n"
                "Strictly avoid synthetic pyrethroid insecticides, which wipe out natural predators and trigger massive mite outbreaks.\n"
                "Spray cold-pressed neem oil or botanical formulations on affected foliage.\n"
                "Encourage farm natural enemies."
            ),
            "chemical": (
                "First confirm whether bronzing and webbing are actively spreading to new leaves.\n"
                "If treatment is necessary, choose a selective product specifically approved for mites (miticide).\n"
                "Ensure thorough spray coverage on the undersides of leaves where mites live.\n"
                "Consult your local agricultural extension service for recommended products."
            ),
        },
        "prevention_monitoring": "Inspect leaf undersides with a hand lens during dry spells and keep plants well-watered.",
        "when_to_consult_expert": "Consult an extension specialist if mite webbing forms dense blankets across multiple rows.",
        "source": "ICAR - Indian Institute of Horticultural Research (IIHR) & TNAU",
    },
    "corn borer": {
        "scientific_name": "Ostrinia furnacalis (Guenée) / Ostrinia nubilalis",
        "crops_affected": ["Maize / Corn", "Sorghum", "Millet", "Bell pepper"],
        "description": "A borer caterpillar that eats small holes in whorl leaves before tunneling into stalks and corn ears.",
        "symptoms": "Row of small 'shot-holes' in unfurled leaves, broken tassels, and sawdust-like frass on stems and ears.",
        "life_cycle": "Moths lay fish-scale egg clusters on leaf undersides. Caterpillars feed in the central leaf funnel, then tunnel inside stalks.",
        "ipm_recommendations": {
            "monitoring": (
                "Inspect the central leaf funnel (whorl) of young maize plants for small 'shot-hole' chew marks.\n"
                "Look for broken tassels and sawdust-like droppings on stalks.\n"
                "Count how many plants show leaf holes across 5 spots in the field.\n"
                "Act while caterpillars are still in the leaf funnel before they enter the stem."
            ),
            "cultural_mechanical": (
                "Shred and plough under maize stalks after harvest to kill overwintering borers.\n"
                "Intercrop maize with legumes like cowpea or beans to boost natural enemy numbers.\n"
                "Avoid planting maize at staggered dates in the same area to break borer breeding.\n"
                "Clear wild grassy weeds from field borders."
            ),
            "biological": (
                "Conserve beneficial egg parasitoid wasps (Trichogramma) and insect-eating birds.\n"
                "Drop eco-friendly biological granules (Bt or Beauveria) directly into the central leaf funnel.\n"
                "Avoid unnecessary broad-spectrum chemical sprays.\n"
                "Encourage natural predators."
            ),
            "chemical": (
                "Treatment is only effective before caterpillars tunnel inside the tough stem.\n"
                "Apply approved products directed into the central leaf funnel if feeding is widespread.\n"
                "Follow product label directions carefully.\n"
                "Consult your local extension office for approved treatments."
            ),
        },
        "prevention_monitoring": "Destroy old corn stalks and inspect leaf whorls weekly before tasseling.",
        "when_to_consult_expert": "Ask an agricultural officer if stem breakage exceeds 5% before flowering.",
        "source": "ICAR - Indian Institute of Maize Research (IIMR)",
    },
    "flea beetle": {
        "scientific_name": "Phyllotreta cruciferae (Goeze)",
        "crops_affected": ["Mustard", "Cabbage", "Radish", "Cauliflower", "Eggplant", "Potato"],
        "description": "Tiny, active dark beetles that jump like fleas when disturbed and chew hundreds of small round holes in leaves.",
        "symptoms": "Seedling leaves riddled with tiny round 'shot-holes', making foliage look like a miniature sieve.",
        "life_cycle": "Adult beetles emerge in spring, jump actively, and chew foliage. Larvae live in the soil and feed on root hairs.",
        "ipm_recommendations": {
            "monitoring": (
                "Check young seedlings every morning when beetles are active on leaves.\n"
                "Look for tiny round holes punched through cotyledons and young leaves.\n"
                "Check whether seedling stands are thinning out.\n"
                "Once plants have 5 or more true leaves, they can easily tolerate light beetle feeding."
            ),
            "cultural_mechanical": (
                "Cover seedling nursery beds with fine insect netting until plants have 4 to 5 true leaves.\n"
                "Plant trap crop borders like radish around cabbage fields to divert beetles.\n"
                "Keep field borders clear of wild mustard weeds where beetles feed.\n"
                "Ensure seedlings are well-watered to help them grow past the vulnerable stage quickly."
            ),
            "biological": (
                "Conserve beneficial ground beetles and soil-dwelling predators.\n"
                "Apply botanical neem oil sprays early in the morning.\n"
                "Use beneficial nematodes in moist soil to target root larvae.\n"
                "Avoid harsh sprays that harm natural predators."
            ),
            "chemical": (
                "Dust seedlings with clean wood ash or neem powder in the early morning when leaves are damp.\n"
                "If seedling stands are threatened by heavy feeding, use an officially approved product.\n"
                "Follow label instructions and extension guidelines carefully.\n"
                "Never invent chemical mixtures."
            ),
        },
        "prevention_monitoring": "Use fine netting over seedlings and keep nursery beds weed-free.",
        "when_to_consult_expert": "Consult an agricultural expert if seedling stand loss exceeds 15% in the first two weeks.",
        "source": "ICAR - Directorate of Rapeseed-Mustard Research & TNAU",
    },
    "black cutworm": {
        "scientific_name": "Agrotis ipsilon (Hufnagel)",
        "crops_affected": ["Potato", "Tomato", "Maize", "Cabbage", "Wheat", "Chili"],
        "description": "A plump, greyish-brown caterpillar that hides in the soil during the day and cuts down seedlings at night.",
        "symptoms": "Young seedling stems severed cleanly at ground level overnight; severed plants lying flat on the soil.",
        "life_cycle": "Caterpillars hide 2 to 5 cm under the soil during daylight and crawl out at dusk to feed on seedling stems.",
        "ipm_recommendations": {
            "monitoring": (
                "Walk seedling rows at sunrise and look for freshly severed plants lying on the ground.\n"
                "Gently scratch the top 5 cm of soil around severed plants to find the curled caterpillar.\n"
                "Count how many seedlings have been cut in each row.\n"
                "Take action as soon as severed plants are noticed."
            ),
            "cultural_mechanical": (
                "Hand-pick and remove cutworms found hiding in the soil near freshly severed plants.\n"
                "Plough fields deeply before transplanting to expose caterpillars to birds and sun.\n"
                "Place protective cardboard or plastic collars (5 cm tall) around valuable transplanted stems.\n"
                "Keep planting beds free of weeds before sowing."
            ),
            "biological": (
                "Protect beneficial ground beetles and birds that actively hunt soil caterpillars.\n"
                "Apply beneficial soil nematodes or biological Bt bait around plant bases.\n"
                "Conserve natural farm predators.\n"
                "Avoid blanket chemical drenching that kills earthworms."
            ),
            "chemical": (
                "Only treat if seedlings are being severed across multiple rows.\n"
                "Use an officially approved bait or collar drench recommended by your local agricultural office.\n"
                "Apply late in the afternoon when caterpillars are about to emerge.\n"
                "Strictly follow product label directions."
            ),
        },
        "prevention_monitoring": "Scratch soil around cut stems early in the morning and practice deep pre-plant tillage.",
        "when_to_consult_expert": "Consult an extension officer if seedling mortality exceeds 5% in the first two weeks.",
        "source": "ICAR - Central Potato Research Institute (CPRI) & TNAU",
    },
    "Thrips": {
        "scientific_name": "Thrips tabaci (Lindeman) / Frankliniella spp.",
        "crops_affected": ["Chili", "Onion", "Cotton", "Tomato", "Capsicum", "Citrus"],
        "description": "Tiny, slender insects with fringed wings that scrape plant cells and suck sap, causing upward leaf curling.",
        "symptoms": "Upward boat-shaped leaf curling, crinkled leaves, silvery streaks on leaf undersides, and scabby fruit surfaces.",
        "life_cycle": "Thrips insert microscopic eggs into leaf tissue. Nymphs feed on young leaves and drop to the soil to pupate.",
        "ipm_recommendations": {
            "monitoring": (
                "Check young shoots and flower buds for upward leaf curling and silvery streaks.\n"
                "Gently shake a flower bud or shoot over a clean white paper sheet to count falling thrips.\n"
                "Install blue sticky traps in the field to detect early flying adults.\n"
                "Do not spray if thrips numbers are very low and leaves are healthy."
            ),
            "cultural_mechanical": (
                "Use overhead sprinkler irrigation to wash thrips off leaves and moisten surface soil.\n"
                "Place reflective silver plastic mulch on soil beds to disorient flying thrips.\n"
                "Keep field borders clear of alternative weed hosts.\n"
                "Plant border rows of maize or sorghum as windbreaks."
            ),
            "biological": (
                "Protect natural predatory pirate bugs (Orius) and predatory mites that feed on thrips.\n"
                "Apply botanical neem seed extract (neem oil) at the first sign of leaf curling.\n"
                "Conserve helpful predatory insects.\n"
                "Avoid broad-spectrum chemical sprays that trigger thrips flare-ups."
            ),
            "chemical": (
                "Only spray if upward leaf curling is stunting new shoots across the field.\n"
                "Use only officially approved products registered for thrips on your crop.\n"
                "Rotate product classes between applications to prevent rapid resistance.\n"
                "Consult your local agricultural extension service for guidance."
            ),
        },
        "prevention_monitoring": "Use blue sticky traps and reflective mulch to deter flying thrips.",
        "when_to_consult_expert": "Consult an extension specialist if upward curling stunts more than 10% of new crop shoots.",
        "source": "ICAR - Indian Institute of Horticultural Research (IIHR) & TNAU",
    },
    "Scirtothrips dorsalis Hood": {
        "scientific_name": "Scirtothrips dorsalis (Hood)",
        "crops_affected": ["Chili", "Tea", "Cotton", "Groundnut", "Citrus", "Roses"],
        "description": "Known as the chili thrips. Causes severe upward leaf curling ('murda' complex) in chili and vegetables.",
        "symptoms": "Leaves curl upward into a boat shape with brown necrotic streaks along veins; stunted apical buds and scabby fruit.",
        "life_cycle": "Eggs inserted inside tender leaves. Life cycle completes in just 2 to 3 weeks in warm weather.",
        "ipm_recommendations": {
            "monitoring": (
                "Inspect tender top shoots weekly for upward boat-shaped leaf curling.\n"
                "Tap chili flower buds over a white sheet of paper to detect moving thrips.\n"
                "Count how many shoots show leaf curling in different rows.\n"
                "Take action early before shoots become stunted."
            ),
            "cultural_mechanical": (
                "Grow 4 border rows of maize or sorghum around chili plots to intercept flying thrips.\n"
                "Use reflective silver mulch on planting beds to repel thrips.\n"
                "Provide sprinkler irrigation to wash foliage.\n"
                "Remove and dispose of severely stunted viral-damaged plants."
            ),
            "biological": (
                "Conserve helpful predatory mites and minute pirate bugs (Orius).\n"
                "Spray botanical neem oil formulation at the first sign of leaf curling.\n"
                "Avoid harsh broad-spectrum sprays that wipe out natural predators.\n"
                "Encourage natural farm biodiversity."
            ),
            "chemical": (
                "Only treat if leaf curling is actively stunting new growth on multiple plants.\n"
                "Use an officially approved product recommended for chili thrips by your extension service.\n"
                "Always rotate between different chemical modes of action to prevent resistance.\n"
                "Wear protective gear and follow label directions."
            ),
        },
        "prevention_monitoring": "Erect barrier crops and scout tender shoots weekly with a hand lens.",
        "when_to_consult_expert": "Ask an agricultural officer if upward curling stunts more than 10% of young shoots.",
        "source": "ICAR - IIHR & TNAU Vegetable Protection Guidelines",
    },
    "Phyllocnistis citrella Stainton": {
        "scientific_name": "Phyllocnistis citrella (Stainton)",
        "crops_affected": ["Citrus (Lime, Lemon, Orange, Pomelo)"],
        "description": "A tiny silvery caterpillar that mines inside young citrus leaves, creating winding silvery tunnels.",
        "symptoms": "Silvery, winding serpentine trails inside young leaves, causing leaf twisting, curling, and chlorosis.",
        "life_cycle": "Tiny moths lay eggs on new flush leaves. The caterpillar lives entirely inside the leaf and pupates at the curled leaf margin.",
        "ipm_recommendations": {
            "monitoring": (
                "Inspect new vegetative flush leaves weekly for glistening silvery trails.\n"
                "Check leaves while they are tender and under 2 cm long.\n"
                "Mature, dark green hardened leaves are not attacked by this pest.\n"
                "Do not spray mature trees when only old leaves show past mines."
            ),
            "cultural_mechanical": (
                "Prune off unwanted water sprouts and off-season tender flush to starve the pest.\n"
                "Regulate watering and fertilizer to produce a single, compact flushing period.\n"
                "Remove heavily mined young shoots on young nursery trees.\n"
                "Keep tree basins clean."
            ),
            "biological": (
                "Protect helpful tiny parasitoid wasps that naturally attack leaf miner larvae.\n"
                "Spray neem oil on newly emerging flush leaves to deter egg laying.\n"
                "Avoid broad-spectrum chemical sprays that kill beneficial wasps.\n"
                "Conserve orchard natural enemies."
            ),
            "chemical": (
                "Only treat during the early flush stage when new leaves are very small.\n"
                "Once leaves harden, spraying is completely ineffective and wastes money.\n"
                "Use an officially approved citrus leaf miner product recommended by your extension office.\n"
                "Follow product label directions carefully."
            ),
        },
        "prevention_monitoring": "Prune water sprouts and synchronize flush timing.",
        "when_to_consult_expert": "Ask an extension specialist if leaf miner trails lead to severe citrus canker bacterial outbreaks.",
        "source": "ICAR - Central Citrus Research Institute (CCRI) & TNAU",
    },
    "Prodenia litura": {
        "scientific_name": "Spodoptera litura (Fabricius) [formerly Prodenia litura]",
        "crops_affected": ["Cotton", "Groundnut", "Tomato", "Chili", "Tobacco", "Soybean"],
        "description": "Historical dataset name for the tobacco caterpillar / cotton leafworm; feeds heavily on leaves and pods.",
        "symptoms": "Leaves skeletonized into paper-like lace, chewed growing tips, and holes in pods or fruit.",
        "life_cycle": "Dense velvety egg clusters laid on leaves. Caterpillars feed actively at night and hide in the soil during the day.",
        "ipm_recommendations": {
            "monitoring": (
                "Inspect the underside of leaves for velvety egg clusters and groups of tiny caterpillars.\n"
                "Check for fresh chewed holes and dark droppings on leaves in early morning.\n"
                "Count damaged plants across multiple rows.\n"
                "Act while caterpillars are small and clustered together."
            ),
            "cultural_mechanical": (
                "Hand-pick and crush egg clusters and groups of young caterpillars.\n"
                "Conduct deep summer ploughing to expose soil pupae to birds and hot sun.\n"
                "Plant border rows of castor or sunflower as trap crops.\n"
                "Keep field borders free of broadleaf weeds."
            ),
            "biological": (
                "Protect natural parasitic wasps and predatory birds in the field.\n"
                "Apply botanical neem oil or biological Bt sprays while caterpillars are small.\n"
                "Avoid harsh chemical sprays that wipe out natural predators.\n"
                "Encourage farm natural enemies."
            ),
            "chemical": (
                "Only treat if leaf damage is actively spreading across the field.\n"
                "Use an officially approved caterpillar product recommended for your crop.\n"
                "Follow label instructions and wear protective gear.\n"
                "Consult your nearest agricultural extension worker."
            ),
        },
        "prevention_monitoring": "Maintain trap crop borders and inspect leaf undersides for egg clusters weekly.",
        "when_to_consult_expert": "Consult an agricultural expert if caterpillars grow large and resist initial treatments.",
        "source": "ICAR - Central Institute for Cotton Research (CICR) & NBAIR",
    },
    "wireworm": {
        "scientific_name": "Agriotes spp. / Melanotus spp. (Elateridae)",
        "crops_affected": ["Potato", "Wheat", "Maize", "Barley", "Sugarbeet"],
        "description": "Hard-bodied, wire-like soil larvae of click beetles that feed on plant roots, seeds, and potato tubers.",
        "symptoms": "Hollowed-out seeds that fail to sprout, wilted seedlings with severed roots, and round holes bored into tubers.",
        "life_cycle": "Wireworms live underground in the soil for 2 to 4 years before transforming into adult click beetles.",
        "ipm_recommendations": {
            "monitoring": (
                "Look for wilting or missing seedlings in scattered patches across the field.\n"
                "Dig 10 cm into the soil around dying plants to check roots and search for hard, yellowish wireworms.\n"
                "Count how many plants are affected in each row.\n"
                "Confirm the presence of wireworms before deciding on any soil treatment."
            ),
            "cultural_mechanical": (
                "Rotate infested fields with non-host crops like mustard or brassicas.\n"
                "Plough and harrow fields thoroughly in summer to expose soil larvae to birds and drying sun.\n"
                "Ensure proper field drainage to avoid soggy soil pockets.\n"
                "Remove old root and crop debris after harvest."
            ),
            "biological": (
                "Conserve natural predatory ground beetles that hunt wireworms in the soil.\n"
                "Apply beneficial biological fungi (Metarhizium or Beauveria) to moist soil.\n"
                "Avoid broad-spectrum chemical soil drenches that kill earthworms.\n"
                "Encourage natural soil biodiversity."
            ),
            "chemical": (
                "Use officially certified seed treatments before planting where fields have a history of wireworms.\n"
                "Never apply unverified chemical soil poisons.\n"
                "Follow product label directions carefully.\n"
                "Consult your local agricultural extension service for approved options."
            ),
        },
        "prevention_monitoring": "Practice summer tillage and rotate with non-host crops.",
        "when_to_consult_expert": "Consult an extension officer if seedling emergence is reduced by more than 10% due to underground tunneling.",
        "source": "ICAR - Central Potato Research Institute (CPRI)",
    },
    "grub": {
        "scientific_name": "Holotrichia consanguinea (Blanchard) / Phyllophaga spp.",
        "crops_affected": ["Groundnut", "Sugarcane", "Maize", "Sorghum", "Soybean"],
        "description": "C-shaped white grubs with brown heads that live in the soil and chew off plant tap roots.",
        "symptoms": "Sudden wilting and drying of plants in expanding patches; wilted plants pull out effortlessly because roots are eaten.",
        "life_cycle": "Adult beetles emerge after early monsoon rains, mate on nearby host trees, and lay eggs in moist soil where grubs feed for months.",
        "ipm_recommendations": {
            "monitoring": (
                "Check for patches of wilted or drying plants that easily pull out of the soil.\n"
                "Dig 15 cm into the soil around wilted plants to find C-shaped white grubs.\n"
                "Look for adult chafer beetles emerging around light sources after initial seasonal rains.\n"
                "Confirm root damage before considering treatment."
            ),
            "cultural_mechanical": (
                "Conduct deep summer ploughing to expose soil grubs to birds and hot sunlight.\n"
                "Shake adult host trees (neem or acacia) at night following first seasonal rains to collect and destroy adult beetles.\n"
                "Rotate groundnut or sugarcane with non-host legume crops.\n"
                "Use well-decomposed manure; avoid fresh uncomposted manure which attracts egg-laying beetles."
            ),
            "biological": (
                "Mix beneficial biological fungi (Metarhizium or Beauveria) into moist farmyard manure and incorporate into soil at sowing.\n"
                "Conserve predatory birds like mynas and egrets that follow the plough to eat grubs.\n"
                "Protect beneficial soil biodiversity.\n"
                "Avoid blanket chemical drenches."
            ),
            "chemical": (
                "Use certified seed treatments before sowing where grubs have a history of causing severe losses.\n"
                "If soil treatment is necessary, use only officially approved products recommended by your extension office.\n"
                "Apply treatments to the root zone at planting.\n"
                "Follow all product label safety instructions."
            ),
        },
        "prevention_monitoring": "Community collection of adult beetles from host trees after first rains and summer tillage.",
        "when_to_consult_expert": "Ask an agricultural officer if dying patches expand rapidly in groundnut or sugarcane fields.",
        "source": "ICAR - Directorate of Groundnut Research (DGR) & TNAU",
    },
    "mole cricket": {
        "scientific_name": "Gryllotalpa gryllotalpa (Linnaeus) / Gryllotalpa africana",
        "crops_affected": ["Rice nursery beds", "Potato", "Tomato", "Turf", "Vegetable seedlings"],
        "description": "Subterranean insects with shovel-like front legs modified for digging tunnels and chewing tender seedling roots.",
        "symptoms": "Raised winding ridges of soil on the surface, uprooted seedlings drying in nursery beds, and chewed tubers.",
        "life_cycle": "Mole crickets live underground in burrow chambers, coming to the surface at night to feed on root collars.",
        "ipm_recommendations": {
            "monitoring": (
                "Look for raised horizontal ridges on the soil surface made by burrowing crickets.\n"
                "Check nursery beds for uprooted, wilting seedlings.\n"
                "Drench a 1-meter square soil patch with soapy water to check if crickets surface.\n"
                "Act early before nursery beds lose too many seedlings."
            ),
            "cultural_mechanical": (
                "Flood rice seedling nursery beds for 24 hours to drive crickets to bund edges where they can be collected.\n"
                "Plough nursery beds thoroughly before sowing.\n"
                "Firm down seedbed soil to discourage burrowing.\n"
                "Keep field borders free of weeds."
            ),
            "biological": (
                "Protect predatory birds and natural insect-eating animals.\n"
                "Apply beneficial entomopathogenic nematodes through irrigation water where available.\n"
                "Conserve natural farm predators.\n"
                "Avoid harsh blanket chemical treatments."
            ),
            "chemical": (
                "Only treat if seedling loss is severe in nursery beds.\n"
                "Use an officially approved product or bait recommended by your local extension worker.\n"
                "Apply in late afternoon near tunnel ridges.\n"
                "Follow product label directions carefully."
            ),
        },
        "prevention_monitoring": "Flood nurseries briefly before sowing and firm down soil beds.",
        "when_to_consult_expert": "Consult an agricultural officer if nursery seedling mortality exceeds 15% due to root damage.",
        "source": "ICAR - NRRI & TNAU Agritech",
    },
}

# Group-informed simple-English recommendations for other IP102 classes
GROUP_RECOMMENDATIONS: Dict[str, Dict[str, Any]] = {
    "Aphid": {
        "crops_affected": ["Cereals", "Vegetables", "Pulses", "Citrus", "Oilseeds"],
        "monitoring": "Check growing tips and leaf undersides weekly. Count affected shoots. Do not spray if ladybugs are present.",
        "cultural_mechanical": "Avoid excess nitrogen fertilizer. Prune or wash off isolated colonies early. Clear weed borders.",
        "biological": "Protect ladybird beetles, lacewings, and hoverflies. Apply botanical neem oil at first appearance.",
        "chemical": "Only treat if colonies spread across most plants. Use an approved selective spray recommended by extension officers.",
    },
    "Leafhopper": {
        "crops_affected": ["Rice", "Cotton", "Vegetables", "Fruit trees", "Mango"],
        "monitoring": "Inspect middle and lower leaf surfaces weekly. Count hoppers across 10 plants. Do not spray for minor numbers.",
        "cultural_mechanical": "Keep field bunds and borders free of wild weed hosts. Ensure good plant spacing for airflow.",
        "biological": "Conserve predatory spiders and helpful field bugs. Avoid harsh sprays that kill natural defenders.",
        "chemical": "Only treat if yellowing damage is spreading. Use an officially approved product for your specific crop.",
    },
    "Planthopper": {
        "crops_affected": ["Rice", "Sugarcane", "Grasses", "Orchard trees"],
        "monitoring": "Part lower plant stems near the water line weekly. Check for drying patches and sticky honeydew.",
        "cultural_mechanical": "Practice alternate wetting and drying water management. Avoid dense planting and excess nitrogen.",
        "biological": "Protect wolf spiders and beneficial mirid bugs. Never apply broad-spectrum pyrethroids that cause resurgence.",
        "chemical": "Target approved treatments specifically to lower stem bases only if numbers are high.",
    },
    "Moth larva": {
        "crops_affected": ["Cereals", "Vegetables", "Legumes", "Cotton", "Fruit crops"],
        "monitoring": "Scout foliage in early morning. Check leaf undersides for egg clusters and small holes. Do not spray minor chew marks.",
        "cultural_mechanical": "Hand-pick and destroy egg clusters. Practice deep summer ploughing. Plant border trap crops.",
        "biological": "Encourage birds by erecting T-perches. Apply neem oil or biological Bt while caterpillars are small.",
        "chemical": "Treat only if leaf chewing is widespread. Use officially approved products registered for caterpillars on your crop.",
    },
    "Weevil": {
        "crops_affected": ["Cereals", "Legumes", "Alfalfa", "Mango", "Root crops"],
        "monitoring": "Inspect leaf margins for notch-shaped chew marks. Check for adult weevils in early morning.",
        "cultural_mechanical": "Clear fallen leaves and damaged fruit. Plough fields to expose overwintering adults in soil.",
        "biological": "Conserve ground beetles and natural soil predators. Apply beneficial entomopathogenic fungi.",
        "chemical": "Spot-treat only if notch-chewing threatens new growth. Use an approved product recommended by extension workers.",
    },
    "Beetle": {
        "crops_affected": ["Legumes", "Vegetables", "Oilseeds", "Orchards"],
        "monitoring": "Scout crops early in the morning when beetles are sluggish. Count damaged leaves across several rows.",
        "cultural_mechanical": "Hand-collect beetles in small plots. Summer ploughing exposes soil pupae. Keep orchard floors clean.",
        "biological": "Protect natural ground beetles and predatory insects. Use neem-based botanical formulations.",
        "chemical": "Only treat if beetle feeding is stunting plants. Follow product label instructions carefully.",
    },
    "Thrips": {
        "crops_affected": ["Chili", "Onion", "Cotton", "Citrus", "Pulses"],
        "monitoring": "Check tender top leaves for upward boat-shaped curling. Tap flower buds over white paper to count thrips.",
        "cultural_mechanical": "Use overhead sprinkler watering to wash foliage. Place reflective silver mulch on planting beds.",
        "biological": "Conserve predatory pirate bugs (Orius) and predatory mites. Spray neem oil at first appearance.",
        "chemical": "Only treat if upward curling is stunting shoots. Rotate chemical classes to prevent resistance.",
    },
    "Fruit fly": {
        "crops_affected": ["Mango", "Guava", "Cucurbits", "Citrus", "Papaya"],
        "monitoring": "Inspect ripening fruit weekly for tiny puncture marks and weeping sap droplets.",
        "cultural_mechanical": "Collect and deeply bury all fallen punctured fruit (>60 cm deep). Bag developing fruits 3 weeks before harvest.",
        "biological": "Protect natural parasitic wasps. Keep orchard floors clean to prevent pupae survival.",
        "chemical": "Use approved pheromone traps or protein bait sprays. Never spray broad-spectrum chemicals on ripening fruit.",
    },
}


def get_pest_management_details(
    dataset_name_or_id: str | int,
    instance_count: int = 1,
) -> Dict[str, Any]:
    """
    Produce comprehensive, evidence-based pest management details for a given IP102 class.
    Uses simplified, everyday English with short sentences and practical advice.
    Avoids complicated terminology, chemical quantities, or unsupported spray schedules.
    """
    if isinstance(dataset_name_or_id, int):
        class_id = dataset_name_or_id
        if 0 <= class_id < len(IP102_CLASSES):
            dataset_name = IP102_CLASSES[class_id]
        else:
            dataset_name = f"unknown_class_{class_id}"
    else:
        dataset_name = str(dataset_name_or_id).strip()
        try:
            class_id = IP102_CLASSES.index(dataset_name)
        except ValueError:
            class_id = -1

    base_meta = get_pest_by_name(dataset_name, class_id=class_id)
    common_name = base_meta.get("common_name", dataset_name.title())
    group = base_meta.get("group", "Agricultural Insect")

    # Check curated data
    curated = CURATED_PEST_MANAGEMENT.get(dataset_name)

    if curated:
        scientific_name = curated.get("scientific_name")
        crops = curated.get("crops_affected", ["Crops associated with " + group.lower()])
        desc = curated.get("description", base_meta.get("description", ""))
        symp = curated.get("symptoms", base_meta.get("symptoms", ""))
        life_cycle = curated.get("life_cycle")
        ipm = curated.get("ipm_recommendations", {})
        prev_mon = curated.get("prevention_monitoring", "Scout crop weekly and monitor weather conditions.")
        consult = curated.get("when_to_consult_expert", "Consult an agricultural extension specialist if crop damage rapidly progresses beyond economic injury levels.")
        source = curated.get("source", "ICAR - National Research Centre for IPM / TNAU Agritech Portal")
    else:
        # Match closest group template
        matched_group = "Moth larva"
        for g_key in GROUP_RECOMMENDATIONS:
            if g_key.lower() in group.lower() or g_key.lower() in dataset_name.lower():
                matched_group = g_key
                break

        group_tmpl = GROUP_RECOMMENDATIONS[matched_group]
        scientific_name = None  # Leave None if not strictly verified
        crops = group_tmpl.get("crops_affected", ["Agricultural field and orchard crops"])
        desc = base_meta.get("description") or f"A member of the {group} group identified in the IP102 dataset."
        symp = base_meta.get("symptoms") or f"Typical feeding damage associated with {group.lower()} on foliage or stems."
        life_cycle = f"Standard life cycle for {group.lower()}; development depends on ambient temperature and field conditions."
        ipm = {
            "monitoring": group_tmpl.get("monitoring", "Scout plants weekly for early signs of feeding damage. Do not spray for a single insect."),
            "cultural_mechanical": group_tmpl.get("cultural_mechanical", "Maintain field sanitation, clear weed borders, and ensure balanced fertilization."),
            "biological": group_tmpl.get("biological", "Protect local predators like spiders and ladybugs. Use botanical neem sprays where suitable."),
            "chemical": group_tmpl.get("chemical", "Only treat if damage is widespread and threatening yields. Use approved products following label directions."),
        }
        prev_mon = "Regular field scouting, clean field borders, and good crop hygiene."
        consult = "Consult your local Krishi Vigyan Kendra (KVK) or university agricultural extension officer if unusual or severe symptoms develop."
        source = "ICAR - National Research Centre for IPM / TNAU Agritech Portal"

    return {
        "class_id": class_id,
        "pest_name": dataset_name,
        "common_name": common_name,
        "scientific_name": scientific_name,
        "group": group,
        "instance_count": max(1, instance_count),
        "crops_affected": crops,
        "description": desc,
        "symptoms": symp,
        "life_cycle": life_cycle,
        "ipm_recommendations": {
            "monitoring": ipm.get("monitoring", ""),
            "cultural_mechanical": ipm.get("cultural_mechanical", ""),
            "biological": ipm.get("biological", ""),
            "chemical": ipm.get("chemical", ""),
        },
        "prevention_monitoring": prev_mon,
        "when_to_consult_expert": consult,
        "source": source,
        "last_reviewed": "October 2026",
        "disclaimer": (
            "AI model detections indicate visual pattern similarity and are not infallible taxonomic determinations. "
            "Always confirm critical crop protection and chemical interventions with a certified agricultural extension officer."
        ),
    }
