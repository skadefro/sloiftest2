import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

function splitText(text) {
    const paragraphs = text.split(/\n\n+/);
    const sentenceRegex = /(?<=[.!?])\s+(?=[A-Z])/;
    return paragraphs.flatMap(paragraph => paragraph.split(sentenceRegex));
}
async function getSentiment_v3(text) {
    const chatCompletion = await openai.chat.completions.create({
  messages: [
      { role: "system", content: `
      You are an sentiment classifier. Your role is to classify the sentiment of customer comments.
      The sentiment classification used to judge whether customers have a positive attitude towards the products we are trying to sell to them. In addition to the general sentiment analysis principles, the following rules must be followed: 
    1) Når kunden er ikke-forpligtet om de næste trin, så er det neutral;
    2) Når kundens svar er passiv, (ved ikke, måske) så er det neutral;
    3) Når kundens feedback er blandet eller vag, (er i tvivl, skal undersøge), så er det neutral;
    4) Hvis hovedindholdet i kommentaren involverer numre (telefonnumre, datoer, adresser, webadresser osv.), så er det neutral;
    5) Hvis det vigtigste indhold af kommentaren domineres af interjektioner, modale partikler, substantiver eller adjektiver uden nogen åbenlyst følelsesmæssig betydning, så er det neutral;
    6) Når kunden direkte angiver deres uinteresse i vores tilbud, så er det negativ;
    7) Når kunden foreslår, at de har fundet foretrukne alternativer, så er det negativ;
    8) Når kunden kommunikerer budgetmæssige eller økonomiske begrænsninger, så er det negativ;
    9) Når kunden har forbehold eller bekymring over vores tilbud, så er det negativ;
    10) Når kunden angiver, at de ikke er i en position eller et humør til at engagere sig, så er det negativ;
    11) Når kunden udtrykker en klar interesse for vores tilbud, så er det positiv;
    12) Når kunden angiver et ønske om fremtidige engagementer eller opfølgninger, så er det positiv;
    13) Når kunden aktivt søger mere information eller afklaringer,så er det positiv;
    14) Når kundens opførsel indikerer en gunstig disposition over for os, så er det positiv;
    15) Når kunden viser en tilbøjelighed til at anbefale eller sprede ordet om os, så er det positiv;
    
    Below are some negative, positive and neutral examples of sentiment analysis for customer comments in csv format, where the customer's comments are enclosed in double quotes, and after the comma is the sentiment classification of the comments:
    -----negative examples-----
    "Kunden nævnte, at vores produkter ikke passer til deres nuværende behov.", negative
    "Kunden udtrykte, at de er tilfredse med deres nuværende leverandør.", negative
    "Kunden sagde, at de ikke ser værdi i det, vi tilbyder.", negative
    "Kunden formidlede, at vores løsninger ikke er i tråd med deres strategi.", negative
    "Kunden nævnte, at de ikke er beslutningstageren for sådanne køb.", negative
    "Kunden sagde, at de allerede har en anden udbyde på listen.", negative
    "Kunden påpegede, at vores tilbud er overflødigt for deres opsætning.", negative
    "Kunden hævdede, at vores produkter er for komplekse til deres krav.", negative
    "Kunden delte, at de har set bedre tilbud andetsteds.", negative
    "Kunden oplyste, at et andet produkt fik deres øje for nylig.", negative
    "Kunden nævnte, at en konkurrent tilbyder flere funktioner til en lignende pris.", negative
    "Kunden udtrykte, at de læner sig mod et andet brand.", negative
    "Kunden påpegede, at vores konkurrents anmeldelser er bedre.", negative
    "Kunden sagde, at de har fået et overbevisende modtilbud af et andet firma.", negative
    "Kunden formidlede, at de har haft en bedre demooplevelse med et andet firma.", negative
    "Kunden føler, at en anden løsning på markedet er mere innovativt.", negative
    "Kunden nævnte, at de står over for budgetnedskæringer og ikke kan overveje vores produkter.", negative
    "Kunden sagde, at vores løsninger er uden for deres prisklasse.", negative
    "Kunden delte, at de prioriterer andre økonomiske forpligtelser.", negative
    "Kunden formidlede, at de ikke har midler til sådanne køb i dette kvartal.", negative
    "Kunden udtrykte, at vores tilbud ikke giver nok ROI til deres forretning.", negative
    "Kunden sagde, at de leder efter flere omkostningseffektive alternativer.", negative
    "Kunden mener, at investering i vores produkter ikke er økonomisk levedygtige for dem.", negative
    "Kunden sagde, at de fryser alle nye indkøb på grund af økonomiske grunde.", negative
    "Kunde udtrykte bekymring for skalerbarheden af ​​vores produkter.", negative
    "Kunden udtrykte tvivl om pålideligheden af ​​vores løsninger.", negative
    "Kunden spurgte den langsigtede support og opdateringer til vores produkter.", negative
    "Kunde delte frygt for den indlæringskurve, der er forbundet med vores løsninger.", negative
    "Kunden føler, at vores produkter måske er for avancerede til deres brugerbase.", negative
    "Kunde formidlede skepsis over for vores påstande og garantier.", negative
    "Kunden har forbehold over vores produkts kompatibilitet med deres eksisterende infrastruktur.", negative
    "Kunden rejste spørgsmål om sikkerheds- og privatlivets funktioner i vores løsninger.", negative
    "Kunden sagde, at Now er ikke et godt tidspunkt at diskutere sådanne køb.", negative
    "Kunden nævnte, at de gennemgår organisatoriske ændringer og kan ikke overveje nye leverandører.", negative
    "Kunden udtrykte, at de ikke er på markedet for sådanne produkter når som helst snart.", negative
    "Kunden erklærede, at de pauser nye engagementer på grund af interne udfordringer.", negative
    "Kunden formidlede, at de er overvældede med lignende pladser og har brug for en pause.", negative
    "Kunden ønsker at fokusere på interne løsninger snarere end eksterne produkter.", negative
    "Kunden sagde, at de er midt i en kontraktmæssig forpligtelse med en anden udbyder.", negative
    "Kunden føler, at de ikke er det rigtige publikum for sådanne produkter.", negative
    -----positive examples-----
    "Kunden spurgte om funktionerne i vores produkt.", positive
    "Kunden ville gerne vide mere om  over at vide mere om vores tjenester.", positive
    "Kunden bad om et detaljeret overblik af vores tilbud.", positive
    "Kunden viste særlig interesse for vores salgssteder.", positive
    "Kunden anmodede om en demo for at få et nærmere kig.", positive
    "Kunden sammenlignede vores tilbud positivt med konkurrenter.", positive
    "Kunden var imponeret over de delte referencer.", positive
    "Kunden kan godt lide vores produktpræsentation.", positive
    "Kunden anmodede om et opfølgende møde.", positive
    "Kunden udtrykte interesse for at deltage i vores kommende webinar.", positive
    "Kunden bad om at blive holdt opdateret om fremtidige produktudgivelser.", positive
    "Kunden ønsker at være en del af den næste produktforsøgsfase.", positive
    "Kunden har bogmærket vores næste workshop i deres kalender.", positive
    "Kunden foreslog et senere opkald.", positive
    "Kunden spurgte om kommende kampagner og tilbud.", positive
    "Kunden viste interesse for vores fremtidige planer.", positive
    "Kunden havde flere spørgsmål om produktspecifikationer.", positive
    "Kunden ønskede at forstå, hvordan vores tjenester adskiller sig fra konkurrenter.", positive
    "Kunden bad om kundesucceshistorier relateret til vores produkter.", positive
    "Kunden var ivrig efter at vide om teknologien bag vores løsninger.", positive
    "Kunden anmodede om referencer fra andre klienter i deres branche.", positive
    "Kunden spurgte om sikkerheden og holdbarheden af ​​vores produkter.", positive
    "Kunden udtrykte nysgerrighed omkring vores innovation.", positive
    "Kunden søgte indsigt hvordan vores produkt bruges optimalt.", positive
    "Kunden sagde at de havde set på vores hjemmeside.", positive
    "Kunden deltog i vores fulde produktdemo -session uden afbrydelser.", positive
    "Kunde gennemgik positivt vores informative materialer.", positive
    "Kunde engageret aktivt under Q & A-sessionen.", positive
    "Kunden noterede sig vores produkt.", positive
    "Kunde besøgte vores stand flere gange under Expo.", positive
    "Kunden udtrykte påskønnelse af vores teams professionalisme.", positive
    "Kunden roser vores engagement i kvalitet og ekspertise.", positive
    "Kunden nævnte, at de ville diskutere vores tilbud med deres team.", positive
    "Kunden udtrykte hensigt at introducere os til branche -kammerater.", positive
    "Kunden sagde, at de ville dele vores produktoplysninger i deres netværk.", positive
    "Kunden viste spænding over vores tilbud på sociale medier.", positive
    "Kunden mente, at vores løsninger kunne passe godt til deres kolleger.", positive
    "Kunden sagde, at de ville sprede ordet ved kommende branchearrangementer.", positive
    "Kunden udtrykte et ønske om at inkludere vores produkt i deres blog.", positive
    "Kunde antydede et potentielt samarbejde eller partnerskab i fremtiden.", positive
    -----neutral examples-----
    "Kunden nævnte, at de stadig behandler de leverede oplysninger.", neutral
    "Kunden syntes hverken entusiastisk eller afvisende over produktet.", neutral
    "Kunden sagde, at de er overvejer vores tilbud.", neutral
    "Kunden syntes ubeslutsom under hele diskussionen.", neutral
    "Kunden sagde, at de ville tænke over det uden at specificere en opfølgning.", neutral
    "Kunden forlod mødet uden at bekræfte interesse eller uinteresse.", neutral
    "Kunden udtrykte et behov for at fordøje forslaget uden at give et endeligt svar.", neutral
    "Kunden anerkendte vores forslag uden at vise en klar intention for fremtiden.", neutral
    "Kunden lyttede til vores præsentation, men gav ingen feedback.", neutral
    "Kunde læser gennem vores forslag uden at stille spørgsmål.", neutral
    "Kunden besøgte vores produktbås, men stillede ikke forespørgsler.", neutral
    "Kunden deltog i vores webinar, men deltog ikke i spørgsmål og svar.", neutral
    "Kunden modtog vores produktprøve, men har ikke delt nogen tanker.", neutral
    "Kunden gennemsøgte vores produktkatalog uden at nulstille nogen vare.", neutral
    "Kunden hørte vores salgstale uden at give kommentarer.", neutral
    "Kunden accepterede vores brochure, men syntes ikke-forpligtet.", neutral
    "Kunden havde både positive og negative bemærkninger, men ingen klar konklusion.", neutral
    "Kunden sagde, at de ser potentiale, men uddybede ikke yderligere.", neutral
    "Kunden nævnte, at de har hørt forskellige anmeldelser om vores produkt.", neutral
    "Kunden syntes fascineret, men stoppede med at udtrykke klar interesse.", neutral
    "Kunden delte, at de ville overveje vores tilbud blandt andre.", neutral
    "Kunden erklærede, at de ville tænke over forslaget uden at give en tidsramme.", neutral
    "Kunden sagde, at de ville diskutere internt uden at indikere en fremtidig handling.", neutral
    "Kunden anerkendte vores unikke salgssteder, men syntes ikke overbevist.", neutral
    "Kunden leverede deres kontoradresse: 123 Main St, men angav ikke, om de vil have et besøg eller ej.", neutral
    "Kunden nævnte, at de er tilgængelige på +123-456-7890 uden at specificere formålet med at dele det.", neutral
    "Under samtalen bemærkede kunden, at deres nuværende kontrakt slutter i 2024 uden at uddybe yderligere.", neutral
    "Kunden delte deres webstedslink: www.example.com, men anmodede ikke om feedback eller diskuterede dens relevans.", neutral
    "Kunden nævnte tilfældigt, at de flyttede til Suite 500 uden at give en klar grund til at dele.", neutral
    "Kunden sagde, at deres operationer startede tilbage i 1998 uden at udtrykke nogen stemning om det.", neutral
    "Kunden angav, at de har 15 grene over hele verden uden at dykke ned i detaljer.", neutral
    "Mens han diskuterede, nævnte kunden deres postkode som 56789 uden yderligere kontekst.", neutral
    "Kunden brugte ofte 'godt', 'um' og 'hmm' under samtalen, hvilket gjorde deres holdning svært at skelne.", neutral
    "Kunden beskrev vores produkt som 'interessant' uden at afklare i hvilken forstand.", neutral
    "Under hele diskussionen henviste kunden til 'enhed', 'modul' og 'system', men udtrykte ikke nogen særlig følelse af dem.", neutral
    "Kundens feedback var fyldt med ord som 'måske' og 'måske', hvilket efterlod deres intentioner tvetydige.", neutral
    "Kunden kommenterede, at funktionerne er 'unikke' og 'forskellige', men udvidede ikke deres synspunkter.", neutral
    "Ved hjælp af udtryk som 'så' og 'derefter uddybede kunden deres nuværende opsætning, men ingen klar hensigt var tydelig.", neutral
    "Kunden nævnte fortsat 'specifikationer', 'tegninger' og 'kladder' under foredraget uden at antydes på nogen handlingslige trin.", neutral
    "Mens han diskuterede, beskrev kunden mødet som 'informativt' uden at antyde, om de fandt det fordelagtigt eller ej.", neutral
  
    reply in json format with the following schema:
    {
      "sentiment": "positive",
      "confidence": 0.9,
      "reason": "Indenholder ordet 'interesseret' og 'solstrålehistorie'",
    }
      ` },
      // { role: 'user', content: 'Følg op på møde tidspunkter, Steffen skrev at det var Carsten der havde aftalt noget med en herude og jeg mener Carsten skød den over på Steffen, så ring til Carsten !.' }],
      { role: 'user', content: text }],
  model: 'gpt-4-1106-preview', //  'gpt-3.5-turbo',
  response_format: { "type": "json_object" },
  
});
var t = chatCompletion.choices[0];
var result = JSON.parse(t.message.content);
return result;
}
async function getSentiment_v4(text) {
    const chatCompletion = await openai.chat.completions.create({
  messages: [
      { role: "system", content: `
      You are an sentiment classifier. Your role is to classify the sentiment of customer comments.
      The sentiment classification used to judge whether customers have a positive attitude towards the products we are trying to sell to them. In addition to the general sentiment analysis principles, the following rules must be followed: 
    1) Når kunden er ikke-forpligtet om de næste trin, så er det neutral;
    2) Når kundens svar er passiv, (ved ikke, måske) så er det neutral;
    3) Når kundens feedback er blandet eller vag, (er i tvivl, skal undersøge), så er det neutral;
    4) Hvis hovedindholdet i kommentaren involverer numre (telefonnumre, datoer, adresser, webadresser osv.), så er det neutral;
    5) Hvis det vigtigste indhold af kommentaren domineres af interjektioner, modale partikler, substantiver eller adjektiver uden nogen åbenlyst følelsesmæssig betydning, så er det neutral;
    6) Når kunden direkte angiver deres uinteresse i vores tilbud, så er det negativ;
    7) Når kunden foreslår, at de har fundet foretrukne alternativer, så er det negativ;
    8) Når kunden kommunikerer budgetmæssige eller økonomiske begrænsninger, så er det negativ;
    9) Når kunden har forbehold eller bekymring over vores tilbud, så er det negativ;
    10) Når kunden angiver, at de ikke er i en position eller et humør til at engagere sig, så er det negativ;
    11) Når kunden udtrykker en klar interesse for vores tilbud, så er det positiv;
    12) Når kunden angiver et ønske om fremtidige engagementer eller opfølgninger, så er det positiv;
    13) Når kunden aktivt søger mere information eller afklaringer,så er det positiv;
    14) Når kundens opførsel indikerer en gunstig disposition over for os, så er det positiv;
    15) Når kunden viser en tilbøjelighed til at anbefale eller sprede ordet om os, så er det positiv;
    
    Below are some negative, positive and neutral examples of sentiment analysis for customer comments in csv format, where the customer's comments are enclosed in double quotes, and after the comma is the sentiment classification of the comments:
    -----negative examples-----
    "Kunden nævnte, at vores produkter ikke passer til deres nuværende behov.", negative
    "Kunden udtrykte, at de er tilfredse med deres nuværende leverandør.", negative
    "Kunden sagde, at de ikke ser værdi i det, vi tilbyder.", negative
    "Kunden formidlede, at vores løsninger ikke er i tråd med deres strategi.", negative
    "Kunden nævnte, at de ikke er beslutningstageren for sådanne køb.", negative
    "Kunden sagde, at de allerede har en anden udbyde på listen.", negative
    "Kunden påpegede, at vores tilbud er overflødigt for deres opsætning.", negative
    "Kunden hævdede, at vores produkter er for komplekse til deres krav.", negative
    "Kunden delte, at de har set bedre tilbud andetsteds.", negative
    "Kunden oplyste, at et andet produkt fik deres øje for nylig.", negative
    "Kunden nævnte, at en konkurrent tilbyder flere funktioner til en lignende pris.", negative
    "Kunden udtrykte, at de læner sig mod et andet brand.", negative
    "Kunden påpegede, at vores konkurrents anmeldelser er bedre.", negative
    "Kunden sagde, at de har fået et overbevisende modtilbud af et andet firma.", negative
    "Kunden formidlede, at de har haft en bedre demooplevelse med et andet firma.", negative
    "Kunden føler, at en anden løsning på markedet er mere innovativt.", negative
    "Kunden nævnte, at de står over for budgetnedskæringer og ikke kan overveje vores produkter.", negative
    "Kunden sagde, at vores løsninger er uden for deres prisklasse.", negative
    "Kunden delte, at de prioriterer andre økonomiske forpligtelser.", negative
    "Kunden formidlede, at de ikke har midler til sådanne køb i dette kvartal.", negative
    "Kunden udtrykte, at vores tilbud ikke giver nok ROI til deres forretning.", negative
    "Kunden sagde, at de leder efter flere omkostningseffektive alternativer.", negative
    "Kunden mener, at investering i vores produkter ikke er økonomisk levedygtige for dem.", negative
    "Kunden sagde, at de fryser alle nye indkøb på grund af økonomiske grunde.", negative
    "Kunde udtrykte bekymring for skalerbarheden af ​​vores produkter.", negative
    "Kunden udtrykte tvivl om pålideligheden af ​​vores løsninger.", negative
    "Kunden spurgte den langsigtede support og opdateringer til vores produkter.", negative
    "Kunde delte frygt for den indlæringskurve, der er forbundet med vores løsninger.", negative
    "Kunden føler, at vores produkter måske er for avancerede til deres brugerbase.", negative
    "Kunde formidlede skepsis over for vores påstande og garantier.", negative
    "Kunden har forbehold over vores produkts kompatibilitet med deres eksisterende infrastruktur.", negative
    "Kunden rejste spørgsmål om sikkerheds- og privatlivets funktioner i vores løsninger.", negative
    "Kunden sagde, at Now er ikke et godt tidspunkt at diskutere sådanne køb.", negative
    "Kunden nævnte, at de gennemgår organisatoriske ændringer og kan ikke overveje nye leverandører.", negative
    "Kunden udtrykte, at de ikke er på markedet for sådanne produkter når som helst snart.", negative
    "Kunden erklærede, at de pauser nye engagementer på grund af interne udfordringer.", negative
    "Kunden formidlede, at de er overvældede med lignende pladser og har brug for en pause.", negative
    "Kunden ønsker at fokusere på interne løsninger snarere end eksterne produkter.", negative
    "Kunden sagde, at de er midt i en kontraktmæssig forpligtelse med en anden udbyder.", negative
    "Kunden føler, at de ikke er det rigtige publikum for sådanne produkter.", negative
    -----positive examples-----
    "Kunden spurgte om funktionerne i vores produkt.", positive
    "Kunden ville gerne vide mere om  over at vide mere om vores tjenester.", positive
    "Kunden bad om et detaljeret overblik af vores tilbud.", positive
    "Kunden viste særlig interesse for vores salgssteder.", positive
    "Kunden anmodede om en demo for at få et nærmere kig.", positive
    "Kunden sammenlignede vores tilbud positivt med konkurrenter.", positive
    "Kunden var imponeret over de delte referencer.", positive
    "Kunden kan godt lide vores produktpræsentation.", positive
    "Kunden anmodede om et opfølgende møde.", positive
    "Kunden udtrykte interesse for at deltage i vores kommende webinar.", positive
    "Kunden bad om at blive holdt opdateret om fremtidige produktudgivelser.", positive
    "Kunden ønsker at være en del af den næste produktforsøgsfase.", positive
    "Kunden har bogmærket vores næste workshop i deres kalender.", positive
    "Kunden foreslog et senere opkald.", positive
    "Kunden spurgte om kommende kampagner og tilbud.", positive
    "Kunden viste interesse for vores fremtidige planer.", positive
    "Kunden havde flere spørgsmål om produktspecifikationer.", positive
    "Kunden ønskede at forstå, hvordan vores tjenester adskiller sig fra konkurrenter.", positive
    "Kunden bad om kundesucceshistorier relateret til vores produkter.", positive
    "Kunden var ivrig efter at vide om teknologien bag vores løsninger.", positive
    "Kunden anmodede om referencer fra andre klienter i deres branche.", positive
    "Kunden spurgte om sikkerheden og holdbarheden af ​​vores produkter.", positive
    "Kunden udtrykte nysgerrighed omkring vores innovation.", positive
    "Kunden søgte indsigt hvordan vores produkt bruges optimalt.", positive
    "Kunden sagde at de havde set på vores hjemmeside.", positive
    "Kunden deltog i vores fulde produktdemo -session uden afbrydelser.", positive
    "Kunde gennemgik positivt vores informative materialer.", positive
    "Kunde engageret aktivt under Q & A-sessionen.", positive
    "Kunden noterede sig vores produkt.", positive
    "Kunde besøgte vores stand flere gange under Expo.", positive
    "Kunden udtrykte påskønnelse af vores teams professionalisme.", positive
    "Kunden roser vores engagement i kvalitet og ekspertise.", positive
    "Kunden nævnte, at de ville diskutere vores tilbud med deres team.", positive
    "Kunden udtrykte hensigt at introducere os til branche -kammerater.", positive
    "Kunden sagde, at de ville dele vores produktoplysninger i deres netværk.", positive
    "Kunden viste spænding over vores tilbud på sociale medier.", positive
    "Kunden mente, at vores løsninger kunne passe godt til deres kolleger.", positive
    "Kunden sagde, at de ville sprede ordet ved kommende branchearrangementer.", positive
    "Kunden udtrykte et ønske om at inkludere vores produkt i deres blog.", positive
    "Kunde antydede et potentielt samarbejde eller partnerskab i fremtiden.", positive
    -----neutral examples-----
    "Kunden nævnte, at de stadig behandler de leverede oplysninger.", neutral
    "Kunden syntes hverken entusiastisk eller afvisende over produktet.", neutral
    "Kunden sagde, at de er overvejer vores tilbud.", neutral
    "Kunden syntes ubeslutsom under hele diskussionen.", neutral
    "Kunden sagde, at de ville tænke over det uden at specificere en opfølgning.", neutral
    "Kunden forlod mødet uden at bekræfte interesse eller uinteresse.", neutral
    "Kunden udtrykte et behov for at fordøje forslaget uden at give et endeligt svar.", neutral
    "Kunden anerkendte vores forslag uden at vise en klar intention for fremtiden.", neutral
    "Kunden lyttede til vores præsentation, men gav ingen feedback.", neutral
    "Kunde læser gennem vores forslag uden at stille spørgsmål.", neutral
    "Kunden besøgte vores produktbås, men stillede ikke forespørgsler.", neutral
    "Kunden deltog i vores webinar, men deltog ikke i spørgsmål og svar.", neutral
    "Kunden modtog vores produktprøve, men har ikke delt nogen tanker.", neutral
    "Kunden gennemsøgte vores produktkatalog uden at nulstille nogen vare.", neutral
    "Kunden hørte vores salgstale uden at give kommentarer.", neutral
    "Kunden accepterede vores brochure, men syntes ikke-forpligtet.", neutral
    "Kunden havde både positive og negative bemærkninger, men ingen klar konklusion.", neutral
    "Kunden sagde, at de ser potentiale, men uddybede ikke yderligere.", neutral
    "Kunden nævnte, at de har hørt forskellige anmeldelser om vores produkt.", neutral
    "Kunden syntes fascineret, men stoppede med at udtrykke klar interesse.", neutral
    "Kunden delte, at de ville overveje vores tilbud blandt andre.", neutral
    "Kunden erklærede, at de ville tænke over forslaget uden at give en tidsramme.", neutral
    "Kunden sagde, at de ville diskutere internt uden at indikere en fremtidig handling.", neutral
    "Kunden anerkendte vores unikke salgssteder, men syntes ikke overbevist.", neutral
    "Kunden leverede deres kontoradresse: 123 Main St, men angav ikke, om de vil have et besøg eller ej.", neutral
    "Kunden nævnte, at de er tilgængelige på +123-456-7890 uden at specificere formålet med at dele det.", neutral
    "Under samtalen bemærkede kunden, at deres nuværende kontrakt slutter i 2024 uden at uddybe yderligere.", neutral
    "Kunden delte deres webstedslink: www.example.com, men anmodede ikke om feedback eller diskuterede dens relevans.", neutral
    "Kunden nævnte tilfældigt, at de flyttede til Suite 500 uden at give en klar grund til at dele.", neutral
    "Kunden sagde, at deres operationer startede tilbage i 1998 uden at udtrykke nogen stemning om det.", neutral
    "Kunden angav, at de har 15 grene over hele verden uden at dykke ned i detaljer.", neutral
    "Mens han diskuterede, nævnte kunden deres postkode som 56789 uden yderligere kontekst.", neutral
    "Kunden brugte ofte 'godt', 'um' og 'hmm' under samtalen, hvilket gjorde deres holdning svært at skelne.", neutral
    "Kunden beskrev vores produkt som 'interessant' uden at afklare i hvilken forstand.", neutral
    "Under hele diskussionen henviste kunden til 'enhed', 'modul' og 'system', men udtrykte ikke nogen særlig følelse af dem.", neutral
    "Kundens feedback var fyldt med ord som 'måske' og 'måske', hvilket efterlod deres intentioner tvetydige.", neutral
    "Kunden kommenterede, at funktionerne er 'unikke' og 'forskellige', men udvidede ikke deres synspunkter.", neutral
    "Ved hjælp af udtryk som 'så' og 'derefter uddybede kunden deres nuværende opsætning, men ingen klar hensigt var tydelig.", neutral
    "Kunden nævnte fortsat 'specifikationer', 'tegninger' og 'kladder' under foredraget uden at antydes på nogen handlingslige trin.", neutral
    "Mens han diskuterede, beskrev kunden mødet som 'informativt' uden at antyde, om de fandt det fordelagtigt eller ej.", neutral
  
    reply in json format with the following schema:
    {
      "sentiment": "positive",
      "confidence": 0.9,
      "reason": "Indenholder ordet 'interesseret' og 'solstrålehistorie'",
    }
      ` },
      // { role: 'user', content: 'Følg op på møde tidspunkter, Steffen skrev at det var Carsten der havde aftalt noget med en herude og jeg mener Carsten skød den over på Steffen, så ring til Carsten !.' }],
      { role: 'user', content: text }],
  model:  'gpt-3.5-turbo',
  
});
var t = chatCompletion.choices[0];
var json = t.message.content;
json = json.split("```json").join("");
json = json.split("```").join("");
var result = JSON.parse(json);
return result;
}
async function get7Ps(text) {
      const chatCompletion = await openai.chat.completions.create({
    messages: [
        { role: "system", content: `
        You are an an expert on 7Ps analysis. Your role is to classify user input.
        Based on the user input, you need to classify the input for each of the following properties
        {
            "properties": {
                "Product": {
                    "type": "string",
                    "description": """
    According to the 7Ps Marketing Mix, identify and extract the 'Product' of 7Ps using nouns. Remeber it's the item or service that we offer to our customers.
    
    Below are some examples of 7Ps analysis for customer comments in csv format, where the customer's comments are enclosed in double quotes, and after the comma is the 7Ps analysis results:
    "han sidder i VVS og har ikke meget med de her sager at gøre", {"product":"VVS", "price":"", "place":"", "promotion":"", "people":"", "process":"", "physical evidence":""}
    "Jan Milling skriver i mail 28 juni at han skal forhandle renovation i oktober og omtaler vores "fine materiale".", {"product":"renovation", "price":"", "place":"", "promotion":"omtaler", "people":"", "process":"", "physical evidence":""}
    "Der har været Opslag på Linked In af Laust omkring affaldssortering og vi talte om at tage vores dialog videre.", {"product":"affaldssortering", "price":"", "place":"", "promotion":"", "people":"", "process":"", "physical evidence":""}
    "Vi skal tale med Mogens Bang om den her.", {"product":"", "price":"", "place":"", "promotion":"", "people":"", "process":"", "physical evidence":""}
    "Er ved at få udvidet butik og har mange kasser stående, efter uge 40 kunne det være interessant, da de åbner en del flere kvadratmeter.", {"product":"kasser", "price":"", "place":"butik", "promotion":"", "people":"", "processes":"", "physical evidence":""}
    "hørkjoler med markup 4-6", {"product":"hørkjoler", "price":"markup", "place":"", "promotion":"", "people":"", "processes":"", "physical evidence":""}
    "Ja, måske, men det kommer an på priser og hvilken kvalitet og hvilket mindste køb han kan lave.", {"product":"kvalitet", "price":"priser, mindste køb", "place":"", "promotion":"", "people":"", "processes":"", "physical evidence":""}
    "hans brand er et mærke som består af klassiske designs, som alt sammen produceres i Italien, økologisk bomuld etc.", {"product":"designs, bomuld, økologisk", "price":"", "place":"Italien", "promotion":"brand", "people":"", "processes":"produceres", "physical evidence":""}
    "Jeg bliver i branchen, han arbejder som konsulent for Pasform for Zizzi i Billund og Sandgaard i Ikast dels for at styre deres&nbsp; Har en online shop til store piger med, Bambus, polyamid, viskose.", {"product":"online shop, Bambus, polyamid, viskose", "price":"", "place":"", "promotion":"", "people":"konsulent, store piger", "processes":"", "physical evidence":""}
    "Materiale på Tankanlæg modtaget sammen med materiale på skueglas (deal 8776)", {'product':'Tankanlæg, skueglas', 'price':'', 'place':'', 'promotion':'', 'people':'', 'processes':'', 'physical evidence':''}
    """,
                },
                "Price": {
                    "type": "string",
                    "description": """
    According to the 7Ps Marketing Mix, identify and extract the 'Price' of 7Ps using nouns. Remeber it's the amount of money that we charge for our product or service.
    
    Below are some examples of 7Ps analysis for some customer comments in csv format, where the customer's comments are enclosed in double quotes, and after the comma is the 7Ps analysis results:
    "Vi skal tale med Mogens Bang om den her.", {"product":"", "price":"", "place":"", "promotion":"", "people":"", "process":"", "physical evidence":""}
    "hørkjoler med markup 4-6", {"product":"hørkjoler", "price":"markup", "place":"", "promotion":"", "people":"", "processes":"", "physical evidence":""}
    "Helle, fordi vi skal ikke investere mere i noget med de salgstider de har.", {"product":"", "price":"investere", "place":"", "promotion":"", "people":"", "processes":"salgstider", "physical evidence":""}
    "Ja, måske, men det kommer an på priser og hvilken kvalitet og hvilket mindste køb han kan lave.", {"product":"kvalitet", "price":"priser, mindste køb", "place":"", "promotion":"", "people":"", "processes":"", "physical evidence":""}
    "Jeg ved ikke hvor lang tid der skal påregnes. Henrik, siger at Bendix afleverer de nye tanke og tager de færdige tanke med tilbage til NH STÅL", {'product':'', 'price':'tanke', 'place':'', 'promotion':'', 'people':'', 'processes':'', 'physical evidence':''}
    "Planlæg hvem der der udfører basic engineering samt tilbud", {'product':'', 'price':'tilbud', 'place':'', 'promotion':'', 'people':'', 'processes':'basic engineering', 'physical evidence':''}
    "send info priser kvaliteter var interesseret vil gerne have noget info og piser", {'product':'', 'price':'priser', 'place':'', 'promotion':'', 'people':'', 'processes':'kvaliteter', 'physical evidence':''}
    """,
                },
                "Place": {
                    "type": "string",
                    "description": """
    According to the 7Ps Marketing Mix, identify and extract the 'Place' of 7Ps using nouns. Remeber it's the channels and locations that we use to distribute and sell our product or service.
    
    Below are some examples of 7Ps analysis for some customer comments in csv format, where the customer's comments are enclosed in double quotes, and after the comma is the 7Ps analysis results:
    "er en del af en kæde så det er dem jeg skal have fat i", {"product":"", "price":"", "place":"kæde", "promotion":"", "people":"", "process":"", "physical evidence":""}
    "vil gerne høre lidt mere om det, et højaktuelt emne og hvad der er på markedet, omvendt det bekymrer ham at give 3.", {"product":"", "price":"", "place":"markedet", "promotion":"", "people":"", "process":"", "physical evidence":""}
    "Vi skal tale med Mogens Bang om den her.", {"product":"", "price":"", "place":"", "promotion":"", "people":"", "process":"", "physical evidence":""}
    "Er ved at få udvidet butik og har mange kasser stående, efter uge 40 kunne det være interessant, da de åbner en del flere kvadratmeter.", {"product":"kasser", "price":"", "place":"butik", "promotion":"", "people":"", "processes":"", "physical evidence":""}
    "De har 2 butikker og en webshop, det de tidligere de har undersøgt var at man skulle bestille 100 styk, og det skal man ikke her, det synes hun var godt.", {"product":"", "price":"", "place":"butikker", "promotion":"", "people":"", "processes":"styk", "physical evidence":""}
    "Vi er en multibrand store, han tror ikke det er aktuelt, han tror ikke de kan sælge noget med deres Cadovius brand i, folk skal kunne kende det so mde har på.", {"product":"", "price":"", "place":"store", "promotion":"multibrand", "people":"", "processes":"", "physical evidence":""}
    "hans brand er et mærke som består af klassiske designs, som alt sammen produceres i Italien, økologisk bomuld etc.", {"product":"designs, bomuld, økologisk", "price":"", "place":"Italien", "promotion":"brand", "people":"", "processes":"produceres", "physical evidence":""}
    "Hvor får vi produceret henne? Send en mail, hvem har vi i Aalborg.", {"product":"", "price":"", "place":"Aalborg", "promotion":"", "people":"", "processes":"produceret", "physical evidence":""}
    "Nejtak Er medlem af en indkøbsforening, mister og Min tøjmand, som han faktisk er bestyrelsesformand for.", {"product":"", "price":"", "place":"indkøbsforening", "promotion":"", "people":"bestyrelsesformand", "processes":"", "physical evidence":""}
    "Opfølgning på Norge, Ny Dobbelthal samt forbrig, 30 nye stationer i dk. samt 4g dongle i Ikast", {'product':'', 'price':'', 'place':'Norge, ny dobbelthal, stationer, Ikast', 'promotion':'', 'people':'', 'processes':'', 'physical evidence':''}
    "Dimensioner under transport.", {'product':'dimensioner', 'price':'', 'place':'transport', 'promotion':'', 'people':'', 'processes':'', 'physical evidence':''}
    """,
                },
                "Promotion": {
                    "type": "string",
                    "description": """
    According to the 7Ps Marketing Mix, identify and extract the 'Promotion' of 7Ps using nouns. Remeber it's the ways that we communicate and advertise our product or service to our target market.
    
    Below are some examples of 7Ps analysis for some customer comments in csv format, where the customer's comments are enclosed in double quotes, and after the comma is the 7Ps analysis results:
    "Christian har skrevet at det ikke var aktuelt lige nu med hjemmesiden til udlejning, da der var kø, så der behøvede ikke PR", {"product":"hjemmesiden", "price":"", "place":"", "promotion":"PR", "people":"", "process":"kø", "physical evidence":""}
    "Jan Milling skriver i mail 28 juni at han skal forhandle renovation i oktober og omtaler vores "fine materiale".", {"product":"renovation", "price":"", "place":"", "promotion":"omtaler", "people":"", "process":"", "physical evidence":""}
    "Vi skal tale med Mogens Bang om den her.", {"product":"", "price":"", "place":"", "promotion":"", "people":"", "process":"", "physical evidence":""}
    "Vi er en multibrand store, han tror ikke det er aktuelt, han tror ikke de kan sælge noget med deres Cadovius brand i, folk skal kunne kende det so mde har på.", {"product":"", "price":"", "place":"store", "promotion":"multibrand", "people":"", "processes":"", "physical evidence":""}
    "hans brand er et mærke som består af klassiske designs, som alt sammen produceres i Italien, økologisk bomuld etc.", {"product":"designs, bomuld, økologisk", "price":"", "place":"Italien", "promotion":"brand", "people":"", "processes":"produceres", "physical evidence":""}
    """,
                },
                "People": {
                    "type": "string",
                    "description": """
    According to the 7Ps Marketing Mix, identify and extract the job titles or positions related to the 'People' component. Focus on the roles involved in creating, delivering, and supporting the product or service, and exclude the specific names of individuals.
    
    Below are some examples of 7Ps analysis for some customer comments in csv format, where the customer's comments are enclosed in double quotes, and after the comma is the 7Ps analysis results:
    "Ikke inde i Niras, han er facility mand", {"product":"", "price":"", "place":"", "promotion":"", "people":"facility mand", "process":"", "physical evidence":""}
    "Har givet den videre til Jan, som er ejer.", {"product":"", "price":"", "place":"", "promotion":"", "people":"", "process":"", "physical evidence":""}
    "Bad MM ringe tilbage eller sende tid for muligt møde på sms.", {"product":"", "price":"", "place":"", "promotion":"", "people":"", "process":"", "physical evidence":""}"Helle Pedersen gik direkte på tlfsvarer.", {"product":"", "price":"", "place":"", "promotion":"", "people":"", "process":"", "physical evidence":""}
    "Vi skal tale med Mogens Bang om den her.", {"product":"", "price":"", "place":"", "promotion":"", "people":"", "process":"", "physical evidence":""}
    "Hun står med en kunde.", {"product":"", "price":"", "place":"", "promotion":"", "people":"kunde", "processes":"", "physical evidence":""}
    "chefen er på ferie, prøv om 14 dage.", {"product":"", "price":"", "place":"", "promotion":"", "people":"chefen", "processes":"", "physical evidence":""}
    "Nejtak Er medlem af en indkøbsforening, mister og Min tøjmand, som han faktisk er bestyrelsesformand for.", {"product":"", "price":"", "place":"indkøbsforening", "promotion":"", "people":"bestyrelsesformand", "processes":"", "physical evidence":""}
    "Jeg bliver i branchen, han arbejder som konsulent for Pasform for Zizzi i Billund og Sandgaard i Ikast dels for at styre deres&nbsp; Har en online shop til store piger med, Bambus, polyamid, viskose.", {"product":"online shop, Bambus, polyamid, viskose", "price":"", "place":"", "promotion":"", "people":"konsulent, store piger", "processes":"", "physical evidence":""}
    "Skal sendes Direkte til kunden", {'product':'', 'price':'', 'place':'', 'promotion':'', 'people':'kunden', 'processes':'', 'physical evidence':''}
    "Han kendte en ven i Alpaco Phillip som pressede på for at han skulle finde en i Pension Danmark. Brian Krogh måske, men Morten gider ikke bruge mere tid på det.", {'product':'', 'price':'', 'place':'', 'promotion':'', 'people':'ven', 'processes':'', 'physical evidence':''}
    "Der er ingen Linda Segerfeldt ansat her Kathrine, tror ikke det er relevant vi er en del af H&amp;M, det kommer fra Stockholm deres produktion af nyhedsbreve. Vi skal igennem H&amp;M, . Content Koordinator Julie 28757751 kan jeg tale med", {'product':'', 'price':'', 'place':'Stockholm', 'promotion':'', 'people':'Content Koordinator', 'processes':'', 'physical evidence':''}
    "kontakt kontoret ring til kæde chef er ved at skære ned på deres leverandører og vil være gode ved dem de har wunderwear samba se om jeg kan finde noget ellers ring igen så har hun et nummer", {'product':'', 'price':'', 'place':'', 'promotion':'', 'people':'kæde chef, leverandører', 'processes':'', 'physical evidence':''}
    
    Remember, please DO NOT extract any individual human names and extract only the job titles or positions. If no job titles or positions are found, the value of the key "people" in result should be an empty string.
    """,
                },
                "Process": {
                    "type": "string",
                    "description": """
    According to the 7Ps Marketing Mix, identify and extract the 'Process' of 7Ps using nouns. Remeber it's the steps and procedures that we follow to ensure quality and efficiency in your product or service delivery.
    
    Below are some examples of 7Ps analysis for some customer comments in csv format, where the customer's comments are enclosed in double quotes, and after the comma is the 7Ps analysis results:
    "Har ringet ind til deres fysioterapi tidsbestilling, men det er outsourcet til Meyers køkkener, så det er nok dem jeg skal tale med", {"product":"", "price":"", "place":"", "promotion":"", "people":"", "process":"outsourcet", "physical evidence":""}
    "Thorballe var positiv, mente tilbuddet var som det skulle være, og det hele er kun stoppet grundet outsourcing, som de ikke kendte til.", {"product":"", "price":"", "place":"", "promotion":"", "people":"", "process":"outsourcing", "physical evidence":""}
    "Vi skal tale med Mogens Bang om den her.", {"product":"", "price":"", "place":"", "promotion":"", "people":"", "process":"", "physical evidence":""}
    "De har 2 butikker og en webshop, det de tidligere de har undersøgt var at man skulle bestille 100 styk, og det skal man ikke her, det synes hun var godt.", {"product":"", "price":"", "place":"butikker", "promotion":"", "people":"", "processes":"styk", "physical evidence":""}
    "Helle, fordi vi skal ikke investere mere i noget med de salgstider de har.", {"product":"", "price":"investere", "place":"", "promotion":"", "people":"", "processes":"salgstider", "physical evidence":""}
    "Hvor får vi produceret henne? Send en mail, hvem har vi i Aalborg.", {"product":"", "price":"", "place":"", "promotion":"", "people":"", "processes":"produceret", "physical evidence":""}
    "hans brand er et mærke som består af klassiske designs, som alt sammen produceres i Italien, økologisk bomuld etc.", {"product":"designs, bomuld, økologisk", "price":"", "place":"Italien", "promotion":"brand", "people":"", "processes":"produceres", "physical evidence":""}
    "Hvor får vi produceret henne? Send en mail, hvem har vi i Aalborg.", {"product":"", "price":"", "place":"Aalborg", "promotion":"", "people":"", "processes":"produceret", "physical evidence":""}
    "Henrik bad om en liste med alle sagerne på mail. Han kigger dem igen og sende kommentar tilbage. Lars Lynderup Hansen svarer ikke. Lagt besked på svarer Lars oplyser at den har vi leveret", {'product':'', 'price':'', 'place':'leveret', 'promotion':'', 'people':'', 'processes':'liste, sagerne', 'physical evidence':''}
    "Mødet er booket indtil videre med Morten.Desuden; Vi kører nogle projekter på Arla, IT standarder og automationsstandarder, navne standarder bliver det første. De afholder 2 timers undervisning i Viby med automationsfolk fra alle mulige steder og de vil gerne invitere vores kontakt til Arla ind for at være med i den undervisning så vi bedre forstår hvad Arla skal bruge.", {'product':'', 'price':'', 'place':'', 'promotion':'', 'people':'automationsfolk', 'processes':'projekter, IT standarder, automationsstandarder, navne standarder, undervisning', 'physical evidence':''}
    "Fjedre uden 3.1 certifikat Forsendelse er sendt fra Ekato d. 14/09", {'product':'fjedre', 'price':'', 'place':'forsendelse', 'promotion':'', 'people':'', 'processes':'certifikat', 'physical evidence':''}
    "har hun ikke brug da det er en second hand, hun har", {'product':'', 'price':'', 'place':'', 'promotion':'', 'people':'', 'processes':'second hand', 'physical evidence':''}
    "Rikke@libenodic.dk vil gerne have noget konkret på hvad vi har lavet og nogle pris eksempler hvilke systuer arbejder vi med. er det nogle ordenlige forhold de arbejder under, (det er vigtigt) er det nogle kontrolleret forhold de arbejder under?", {'product':'', 'price':'pris', 'place':'systuer', 'promotion':'', 'people':'', 'processes':'ordentlige forhold, kontrolleret forhold', 'physical evidence':''}
    "Henrik bad om en liste med alle sagerne på mail. Han kigger dem igen og sende kommentar tilbage. Martin Laurberg oplyser at de ikke vandt opgaven. Den gik til hoved entreprenøren", {'product':'', 'price':'', 'place':'', 'promotion':'', 'people':'', 'processes':'liste', 'physical evidence':''}
    "Udestående punkter: The torque for the fixing of the set screws will be suppliedWrong screw connections for the mounting of the gearbox on the lantern will be sent via tracked shipment to Yara'EKATO will send shipping notification when agitators leave our premisesData Sheet of the hardened set screw material or additional information will be sent to Yara 11-08 HPL Rykker Nico for update 14-08 HPL Rykker igen", {'product':'torque, set screws, screw connections, gearbox, lantern, agitators, Data sheet', 'price':'', 'place':'premises', 'promotion':'', 'people':'', 'processes':'fixing, supplied, mounting, shipment, tracked, shipping notification', 'physical evidence':''}
    "Robert Voss har fået tilsendt OB da han bestilte O-ringene. Der er aldrig kommet en ordre. Gensender OB og beder om accept samt PO. Tilbud skal opdateres hvis Robert forsat ønsker O-ringene. 08-08-2023 - Reminder sendt til Robert 080-08-2023 - Robert vender tilbage med en lang liste over det som O-ringene skal efterleve. Eftersom den vedhæftede dokumentation kun nævner overensstemmelse til FDA, så mangler der en hel del ifht. vores krav angivet i V1.3.06 Specifikation of Food Contact Materials. Det gælder både EU lovgivning og egne krav. Vi skal have dokumentation for følgende:Declaration of compliance acc. to 1935/2004/EC on materials and articles intended to come into contact with foodDeclaration of compliance acc. to 2023/2006/EC Good Manufacturing PracticeDeclaration of compliance acc. to 1907/2006/EC concerning the Registration, Evaluation, Authorization and Restriction of Chemicals (REACH)Documentation for the suitability of the FCM to specified food category and conditions of useFree of Animal Derived Ingredients and produced without any culture steps (fermentation)Declaration stating that the materials are free of Bisphenol A.Declaration stating that the materials are free of phthalates.Declaration stating that the materials are free of latexHvis det er Nordic Engineering, der lagerfører og sælger O-ringene til os skal de også dokumentere:Declaration of compliance acc. to Bek. 681/2020 Food contact Material (Danish suppliers)Declaration of compliance acc. to Bek. 1352/2019 Authorization and registration (Danish suppliers)", {'product':'O-ringene', 'price':'Tilbud', 'place':'', 'promotion':'', 'people':'', 'processes':'ordre, dokumentation, EU lovgivning', 'physical evidence':''}
    """,
                },
                "Physical evidence": {
                    "type": "string",
                    "description": """
    According to the 7Ps Marketing Mix, identify and extract the 'Physical evidence' of 7Ps using nouns. Remeber it's the tangible and intangible aspects that show and prove our product or service quality and value.
    
    Below are some examples of 7Ps analysis for some customer comments in csv format, where the customer's comments are enclosed in double quotes, and after the comma is the 7Ps analysis results:
    "Vi skal tale med Mogens Bang om den her.", {"product":"", "price":"", "place":"", "promotion":"", "people":"", "process":"", "physical evidence":""}
    """,
                },
            },
            "required": ["Product", "Price", "Place", "Promotion", "People", "Process", "Physical evidence"],
        }
      reply in json format, using this schema
        ` },
        // { role: 'user', content: 'Følg op på møde tidspunkter, Steffen skrev at det var Carsten der havde aftalt noget med en herude og jeg mener Carsten skød den over på Steffen, så ring til Carsten !.' }],
        { role: 'user', content: text }],
    model: 'gpt-4-1106-preview', //  'gpt-3.5-turbo',
    response_format: { "type": "json_object" },
    
  });
  var t = chatCompletion.choices[0];
  var result = JSON.parse(t.message.content);
  if(result?.properties != null) return result.properties; // mosly when using gpt 3.5 turbo
  return result;
}


async function process_note(text) {
  var sentences = splitText(text);
  const _ai = [];
  for(let i = 0; i < sentences.length; i++) {
      const sentence = sentences[i];
      var sentiment = await getSentiment_v3(sentence);
      let the7Ps = {People:'',
          'Physical evidence': '',
          Place: '',
          Price: '',
          Process : 'besked',
          Product:  'sag',
          Promotion:  ''};
      if(sentiment.sentiment == "positive" || sentiment.sentiment == "negative") {
          the7Ps = await get7Ps(sentence);
      }
      _ai.push({sentence: sentence, sentiment: sentiment, the7Ps: the7Ps});
  }
  return _ai;
}

async function main() {
    var text = 'Er meget interreseret, send et overslag på Picca og CD Automation.';
    // var text = 'Denne sag er tabt og det har Michael fra os fået besked om.';
    // var text = 'Følg op på møde tidspunkter, Steffen skrev at det var Carsten der havde aftalt noget med en herude og jeg mener Carsten skød den over på Steffen, så ring til Carsten !.';
  console.log(await process_note(text));

}

main();
