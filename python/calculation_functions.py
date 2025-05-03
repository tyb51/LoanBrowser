# -*- coding: utf-8 -*-
# Stap 1: Imports (voeg scipy toe)
import numpy as np
import pandas as pd
import numpy_financial as npf
from scipy import optimize # Voor root finding



# --- Constanten (identiek) ---
START_KAPITAAL = 120000
AANKOOPPRIJS_WONING = 825000
JAARLIJKSE_GROEI_INVESTERING = 0.08 # Rendement op alternatieve investering
MAANDELIJKSE_GROEI_INVESTERING = (1 + JAARLIJKSE_GROEI_INVESTERING)**(1/12) - 1
START_JAAR_KALENDER = 2025 # Voor SSV mapping
START_LEEFTIJD = 30 # Voor SSV bullet berekening

# --- Stap 2: Schuldsaldo Verzekering Data (Aangepast) ---
start_jaar_tabel = 2025
eind_jaar_tabel = 2049
premies_tabel_jaarlijks_100pct = {
    2025: 539.58, 2026: 563.91, 2027: 600.41, 2028: 624.74, 2029: 645.00,
    2030: 656.09, 2031: 674.83, 2032: 694.56, 2033: 709.42, 2034: 724.00,
    2035: 737.36, 2036: 752.82, 2037: 760.56, 2038: 767.81, 2039: 769.15,
    2040: 763.40, 2041: 752.23, 2042: 733.47, 2043: 702.50, 2044: 657.83,
    2045: 596.22, 2046: 515.62, 2047: 412.18, 2048: 280.36, 2049: 114.79
}
# Basispremie voor leeftijd 30 (jaar 1)
ssv_basis_premie_jaar1 = premies_tabel_jaarlijks_100pct[start_jaar_tabel]

def schat_schuldsaldo_premie(
    simulatie_jaar,
    start_jaar_lening,
    loan_type='annuity', # 'annuity' of 'bullet'/'modular'
    dekking_pct=1.0,
    jaarlijkse_stijging_bullet=0.04 # 4% stijging per jaar voor bullet
    ):
    """ Past SSV schatting aan voor bullet leningen. """
    if loan_type == 'annuity':
        # Gebruik tabel voor annuïteiten
        kalender_jaar = start_jaar_lening + simulatie_jaar - 1
        premie_100pct = premies_tabel_jaarlijks_100pct.get(kalender_jaar, premies_tabel_jaarlijks_100pct.get(eind_jaar_tabel, 0))
    else: # 'bullet' of 'modular'
        # Gebruik basispremie jaar 1 en verhoog jaarlijks met stijgingspercentage
        # Dit is een *vereenvoudigd* model dat stijging door leeftijd simuleert bij hoog kapitaal
        premie_100pct = ssv_basis_premie_jaar1 * ((1 + jaarlijkse_stijging_bullet) ** (simulatie_jaar - 1))

    return premie_100pct * dekking_pct

# --- Simulatie Functies (Aanpassing: geef loan_type door aan SSV) ---

# Functie: Klassieke Lening (Annuïteit) - voeg loan_type toe
# --- GECORRIGEERDE Functie: Klassieke Lening (Annuïteit) ---
def simuleer_klassieke_lening(
    eigen_inbreng,
    jaarlijkse_rentevoet,
    looptijd_jaren,
    aankoopprijs=AANKOOPPRIJS_WONING,
    uitstel_maanden=0,
    start_jaar_kalender=START_JAAR_KALENDER,
    schuldsaldo_dekking_pct=1.0,
    loan_type='annuity' # Belangrijk voor SSV berekening
):
    """Simuleert een klassieke lening zonder woningwaardegroei."""
    hoofdsom = aankoopprijs - eigen_inbreng
    if hoofdsom <= 0:
        print("Info: Geen lening nodig (eigen inbreng >= aankoopprijs).")
        return pd.DataFrame() # Lege DataFrame

    maandelijkse_rentevoet = jaarlijkse_rentevoet / 12
    totaal_maanden = looptijd_jaren * 12
    afbetalings_maanden = totaal_maanden - uitstel_maanden

    if afbetalings_maanden <= 0:
        raise ValueError("Looptijd moet langer zijn dan de uitstelperiode.")

    resterend_kapitaal = hoofdsom
    data = []
    cumulatief_kapitaal_betaald = 0
    cumulatief_rente_betaald = 0
    cumulatief_ssv_betaald = 0
    # Initialiseer ssv hier om UnboundLocalError te voorkomen als loop niet start
    huidige_jaarlijkse_ssv = 0

    if maandelijkse_rentevoet > 0:
         vaste_betaling = npf.pmt(maandelijkse_rentevoet, afbetalings_maanden, -hoofdsom) # pmt verwacht negatieve pv
    else:
         vaste_betaling = hoofdsom / afbetalings_maanden if afbetalings_maanden > 0 else 0

    for maand in range(1, totaal_maanden + 1): # 'maand' wordt hier gedefinieerd
        simulatie_jaar = ((maand - 1) // 12) + 1

        # Haal SSV premie op aan het begin van elk *simulatie* jaar
        if (maand - 1) % 12 == 0:
             huidige_jaarlijkse_ssv = schat_schuldsaldo_premie( # Deze wordt nu correct binnen de loop aangeroepen
                 simulatie_jaar, start_jaar_kalender, loan_type, schuldsaldo_dekking_pct
             )
        # Bereken maandelijkse SSV op basis van de laatst opgehaalde jaarlijkse premie
        maandelijkse_ssv = huidige_jaarlijkse_ssv / 12

        rente_deze_maand = resterend_kapitaal * maandelijkse_rentevoet

        if maand <= uitstel_maanden:
            kapitaal_deze_maand = 0
            betaling_lening_excl_ssv = rente_deze_maand # Aanname: enkel rente tijdens uitstel
        else:
            betaling_lening_excl_ssv = vaste_betaling
            kapitaal_deze_maand = betaling_lening_excl_ssv - rente_deze_maand
             # Correcties voor laatste maand / afronding
            kapitaal_deze_maand = min(kapitaal_deze_maand, resterend_kapitaal)
            if abs(resterend_kapitaal - kapitaal_deze_maand) < 0.01 : # Bijna afgelost
                 kapitaal_deze_maand = resterend_kapitaal
                 # Herbereken betaling voor laatste maand indien nodig
                 betaling_lening_excl_ssv = kapitaal_deze_maand + rente_deze_maand

        resterend_kapitaal -= kapitaal_deze_maand
        if resterend_kapitaal < 0.01: resterend_kapitaal = 0

        cumulatief_kapitaal_betaald += kapitaal_deze_maand
        cumulatief_rente_betaald += rente_deze_maand
        cumulatief_ssv_betaald += maandelijkse_ssv
        totale_maandelijkse_uitgave = betaling_lening_excl_ssv + maandelijkse_ssv

        data.append({
            "Maand": maand, "Jaar": simulatie_jaar,
            "Betaling Lening (Excl. SSV)": betaling_lening_excl_ssv,
            "Rente": rente_deze_maand, "Kapitaal Aflossing": kapitaal_deze_maand,
            "Schuldsaldo Premie (Maand)": maandelijkse_ssv,
            "Totale Maandelijkse Uitgave": totale_maandelijkse_uitgave,
            "Resterend Kapitaal": resterend_kapitaal,
            "Cumulatief Kapitaal Betaald": cumulatief_kapitaal_betaald,
            "Cumulatief Rente Betaald": cumulatief_rente_betaald,
            "Cumulatief SSV Betaald": cumulatief_ssv_betaald,
        })
    return pd.DataFrame(data)

# --- GECORRIGEERDE Functie: Modulaire/Bullet Lening ---
def simuleer_modulaire_lening(
    eigen_inbreng,
    jaarlijkse_rentevoet,
    looptijd_jaren,
    aflossings_schema, # List of tuples: [(maand1, bedrag1), ...]
    aankoopprijs=AANKOOPPRIJS_WONING,
    start_jaar_kalender=START_JAAR_KALENDER,
    schuldsaldo_dekking_pct=1.0,
    loan_type='bullet' # Belangrijk voor SSV berekening
):
    """Simuleert een modulaire/bullet lening zonder woningwaardegroei."""
    hoofdsom = aankoopprijs - eigen_inbreng
    if hoofdsom <= 0:
        print("Info: Geen lening nodig (eigen inbreng >= aankoopprijs).")
        return pd.DataFrame()

    maandelijkse_rentevoet = jaarlijkse_rentevoet / 12
    totaal_maanden = looptijd_jaren * 12
    aflossingen_dict = dict(aflossings_schema)

    resterend_kapitaal = hoofdsom
    data = []
    cumulatief_kapitaal_betaald = 0
    cumulatief_rente_betaald = 0
    cumulatief_ssv_betaald = 0
    # Initialiseer ssv hier
    huidige_jaarlijkse_ssv = 0

    for maand in range(1, totaal_maanden + 1): # 'maand' wordt hier gedefinieerd
        simulatie_jaar = ((maand - 1) // 12) + 1

        # Haal SSV premie op aan het begin van elk *simulatie* jaar
        if (maand - 1) % 12 == 0:
             huidige_jaarlijkse_ssv = schat_schuldsaldo_premie( # Deze wordt nu correct binnen de loop aangeroepen
                 simulatie_jaar, start_jaar_kalender, loan_type, schuldsaldo_dekking_pct
             )
        # Bereken maandelijkse SSV op basis van de laatst opgehaalde jaarlijkse premie
        maandelijkse_ssv = huidige_jaarlijkse_ssv / 12

        rente_deze_maand = resterend_kapitaal * maandelijkse_rentevoet
        kapitaal_deze_maand = aflossingen_dict.get(maand, 0)
        kapitaal_deze_maand = min(kapitaal_deze_maand, resterend_kapitaal)

        betaling_lening_excl_ssv = rente_deze_maand + kapitaal_deze_maand

        resterend_kapitaal -= kapitaal_deze_maand
        if resterend_kapitaal < 0.01: resterend_kapitaal = 0

        cumulatief_kapitaal_betaald += kapitaal_deze_maand
        cumulatief_rente_betaald += rente_deze_maand
        cumulatief_ssv_betaald += maandelijkse_ssv
        totale_maandelijkse_uitgave = betaling_lening_excl_ssv + maandelijkse_ssv

        data.append({
             "Maand": maand, "Jaar": simulatie_jaar,
             "Betaling Lening (Excl. SSV)": betaling_lening_excl_ssv,
             "Rente": rente_deze_maand, "Kapitaal Aflossing": kapitaal_deze_maand,
             "Schuldsaldo Premie (Maand)": maandelijkse_ssv,
             "Totale Maandelijkse Uitgave": totale_maandelijkse_uitgave,
             "Resterend Kapitaal": resterend_kapitaal,
             "Cumulatief Kapitaal Betaald": cumulatief_kapitaal_betaald,
             "Cumulatief Rente Betaald": cumulatief_rente_betaald,
             "Cumulatief SSV Betaald": cumulatief_ssv_betaald,
        })

        # Optioneel: stop simulatie als kapitaal volledig is afgelost
        # if resterend_kapitaal == 0 and kapitaal_deze_maand > 0:
        #     print(f"Info: Lening volledig afgelost in maand {maand}.")
        #     break # Uncomment om te stoppen na volledige aflossing
    return pd.DataFrame(data)




# --- Stap X: Functie: Jaarlijkse Aggregatie ---
def aggregeer_jaarlijks(df_maandelijks):
    """Aggregeert maandelijkse lening data naar jaarlijkse totalen en saldi."""
    if df_maandelijks.empty:
        return pd.DataFrame()

    jaarlijkse_data = df_maandelijks.groupby('Jaar').agg(
        Jaarlijkse_Rente=('Rente', 'sum'),
        Jaarlijkse_Kapitaalaflossing=('Kapitaal Aflossing', 'sum'),
        Jaarlijkse_SSV=('Schuldsaldo Premie (Maand)', 'sum'),
        Jaarlijkse_Totale_Uitgave=('Totale Maandelijkse Uitgave', 'sum'),
        Resterend_Kapitaal_Einde_Jaar=('Resterend Kapitaal', 'last'), # Einde van het jaar
        Cumul_Rente_Einde_Jaar=('Cumulatief Rente Betaald', 'last'),
        Cumul_SSV_Einde_Jaar=('Cumulatief SSV Betaald', 'last'),
        Cumul_Kapitaal_Einde_Jaar=('Cumulatief Kapitaal Betaald', 'last')
    ).reset_index()
    return jaarlijkse_data

# --- Stap Y: Functie: Jaarlijkse Vergelijking ---
def vergelijk_jaarlijks(df_jaarlijks_ref, df_jaarlijks_alt, naam_ref, naam_alt):
    """Vergelijkt twee jaarlijkse dataframes en toont verschillen."""
    if df_jaarlijks_ref.empty or df_jaarlijks_alt.empty:
        print("Een van de dataframes voor jaarlijkse vergelijking is leeg.")
        return pd.DataFrame()

    # Zorg dat beide dataframes dezelfde jaren hebben voor vergelijking
    merged_df = pd.merge(df_jaarlijks_ref, df_jaarlijks_alt, on='Jaar', suffixes=(f'_{naam_ref}', f'_{naam_alt}'), how='outer')
    merged_df = merged_df.fillna(0) # Vul ontbrekende jaren met 0

    vergelijk_df = pd.DataFrame()
    vergelijk_df['Jaar'] = merged_df['Jaar']

    # Bereken verschillen (Alternatief - Referentie)
    cols_to_compare = ['Jaarlijkse_Rente', 'Jaarlijkse_Kapitaalaflossing', 'Jaarlijkse_SSV',
                       'Jaarlijkse_Totale_Uitgave', 'Resterend_Kapitaal_Einde_Jaar']

    for col in cols_to_compare:
        col_ref = f"{col}_{naam_ref}"
        col_alt = f"{col}_{naam_alt}"
        vergelijk_df[f'Verschil_{col}'] = merged_df[col_alt] - merged_df[col_ref]

    return vergelijk_df

# --- Stap Z: Functie: Stepped Plot Investering Saldo ---
def plot_investering_saldo_jaarlijks(df_combined, titel):
    """Maakt een stepped plot van het jaarlijkse investeringssaldo."""
    if df_combined.empty or 'Saldo Investering' not in df_combined.columns:
        print(f"DataFrame voor '{titel}' (investering) is leeg of mist data, kan niet plotten.")
        return

    # Aggregeer saldo per jaar (laatste waarde van het jaar)
    df_jaarlijks = df_combined.groupby('Jaar')['Saldo Investering'].last().reset_index()

    plt.figure(figsize=(12, 7))
    plt.step(df_jaarlijks['Jaar'], df_jaarlijks['Saldo Investering'], where='post', label='Saldo Investering Einde Jaar')

    plt.title(f"{titel}\nJaarlijks Saldo Alternatieve Investering", fontsize=14)
    plt.xlabel("Jaar")
    plt.ylabel("Saldo Investering (€)")
    plt.legend()
    plt.grid(True)
    ax = plt.gca()
    ax.yaxis.set_major_formatter(plt.FuncFormatter(lambda x, p: format(int(x), ',')))
    # Zorg dat x-as alleen gehele jaren toont
    ax.xaxis.set_major_locator(plt.MaxNLocator(integer=True))
    plt.tight_layout()
    plt.show()


# --- Stap W: Functie: Minimale Groei Berekening ---
def bereken_min_groei_voor_betaling(
    df_combined, # Resultaat van simuleer_met_investering
    payment_maand,
    payment_bedrag,
    start_investering # Initieel geïnvesteerd kapitaal
    ):
    """Berekent de minimaal benodigde jaarlijkse groei om een betaling te halen."""

    if df_combined.empty or 'Maandelijkse Bijdrage/Onttrekking' not in df_combined.columns:
        print("Kan minimale groei niet berekenen: investeringsdata ontbreekt.")
        return None

    # Haal maandelijkse bijdragen op tot de betalingsmaand
    contributions = df_combined[df_combined['Maand'] <= payment_maand]['Maandelijkse Bijdrage/Onttrekking'].values
    # De *eerste* bijdrage in df_combined is het verschil in maand 1.
    # De start_investering is het bedrag *voor* maand 1.

    # Functie die de eindwaarde berekent gegeven een *maandelijkse* groei rate 'r'
    def calculate_future_value(monthly_rate):
        r = monthly_rate
        if r <= -1: # Voorkom delen door nul of negatieve basis
            return -np.inf # Ongeldige rate

        fv = start_investering * (1 + r)**payment_maand
        # Voeg future value van elke maandelijkse bijdrage toe
        # Bijdrage C_i (in maand i) groeit voor (payment_maand - i) maanden
        for i in range(len(contributions)):
             maand = i + 1 # Maand nummer (1-based)
             periods_to_grow = payment_maand - maand
             if periods_to_grow >= 0:
                 fv += contributions[i] * (1 + r)**periods_to_grow
        return fv

    # Target functie voor de solver: eindwaarde - doelbedrag = 0
    def target_function(monthly_rate):
        return calculate_future_value(monthly_rate) - payment_bedrag

    # Probeer de root te vinden (de maandelijkse groei rate)
    # We zoeken een rate tussen -10% en +100% per maand (ruime schatting)
    try:
        # Brentq is robuust voor het vinden van een root binnen een interval
        # We zoeken een rate waar de functie van teken wisselt (e.g., van negatief naar positief)
        # Test een paar punten:
        val_low = target_function(-0.05) # -5% per maand
        val_high = target_function(0.10) # +10% per maand

        # Controleer of de functie van teken wisselt in dit interval
        if np.sign(val_low) != np.sign(val_high):
             monthly_rate_solution = optimize.brentq(target_function, -0.05, 0.10, xtol=1e-6, rtol=1e-6)
             # Converteer naar jaarlijkse rate
             annual_rate_solution = (1 + monthly_rate_solution)**12 - 1
             return annual_rate_solution
        else:
             # Probeer een breder interval of geef aan dat het niet gevonden is
             # Dit kan gebeuren als zelfs met hoge groei het doel niet gehaald wordt,
             # of als zelfs met negatieve groei het doel al overschreden wordt (onwaarschijnlijk hier)
             print(f"Waarschuwing: Kon geen oplossing vinden voor min. groei in het standaard interval.")
             # Je zou hier fsolve kunnen proberen zonder interval, maar dat is minder betrouwbaar
             # Probeer fsolve met een startpunt (bv 0)
             try:
                 monthly_rate_solution, info, ier, msg = optimize.fsolve(target_function, x0=0.0, full_output=True)
                 if ier == 1: # Oplossing gevonden
                      annual_rate_solution = (1 + monthly_rate_solution[0])**12 - 1
                      return annual_rate_solution
                 else:
                      print(f"fsolve faalde ook: {msg}")
                      return None
             except Exception as e:
                 print(f"Fout tijdens fsolve: {e}")
                 return None

    except Exception as e:
        print(f"Fout tijdens zoeken naar minimale groei: {e}")
        return None


# --- Simulatie met Investering (Hergebruik vorige versie) ---
# Zorg dat de functie `simuleer_met_investering` beschikbaar is (code uit vorig antwoord)
# --- [HIER CODE VOOR simuleer_met_investering Kopiëren] ---
def simuleer_met_investering(
    df_referentie, # DataFrame van de 'basis' lening (bv. Klassiek)
    df_alternatief, # DataFrame van de alternatieve lening (bv. Bullet)
    eigen_inbreng_referentie,
    eigen_inbreng_alternatief,
    start_kapitaal_totaal=START_KAPITAAL,
    maandelijkse_groei_investering=MAANDELIJKSE_GROEI_INVESTERING
):
    """Vergelijkt twee leningen en simuleert investering van vrijgekomen cash."""

    # Bepaal initieel te investeren kapitaal
    start_investering = start_kapitaal_totaal - eigen_inbreng_alternatief
    if start_investering < 0:
        print("Waarschuwing: Eigen inbreng alternatief > startkapitaal. Start investering = 0.")
        start_investering = 0

    # Zorg dat beide dataframes dezelfde maximale maand hebben voor vergelijking
    max_maand = max(df_referentie['Maand'].max() if not df_referentie.empty else 0,
                    df_alternatief['Maand'].max() if not df_alternatief.empty else 0)

    # Voeg totale maandelijkse uitgave toe als die mist (voor lege DFs)
    if 'Totale Maandelijkse Uitgave' not in df_referentie.columns:
        df_referentie['Totale Maandelijkse Uitgave'] = 0
    if 'Totale Maandelijkse Uitgave' not in df_alternatief.columns:
        df_alternatief['Totale Maandelijkse Uitgave'] = 0

    # Maak DataFrames met maand als index voor makkelijke lookup
    ref_uitgaven = df_referentie.set_index('Maand')['Totale Maandelijkse Uitgave']
    alt_uitgaven = df_alternatief.set_index('Maand')['Totale Maandelijkse Uitgave']
    
    investering_data = []
    huidige_investering_saldo = start_investering
    cumulatieve_investering_bijdrage = start_investering
    # Maak kolom 'Maandelijkse Bijdrage/Onttrekking' beschikbaar buiten de loop
    maandelijkse_bijdrage = []
    for maand in range(1, max_maand + 1):
        # Groei van bestaand saldo
        huidige_investering_saldo *= (1 + maandelijkse_groei_investering)

        # Verschil in maandelijkse uitgaven
        uitgave_ref = ref_uitgaven.get(maand, 0)
        uitgave_alt = alt_uitgaven.get(maand, 0)
        verschil = uitgave_ref - uitgave_alt # Positief als alternatief goedkoper is

        # Voeg verschil toe aan investering (of haal eraf)
        # We gaan ervan uit dat als alternatief duurder is, dit uit de investering komt
        huidige_investering_saldo += verschil
        cumulatieve_investering_bijdrage += verschil

        # Zorg dat saldo niet negatief wordt (als investering niet volstaat)
        # In een realistisch scenario zou je hier extra geld moeten toevoegen
        if huidige_investering_saldo < 0:
            #print(f"Waarschuwing Maand {maand}: Investeringssaldo ontoereikend ({huidige_investering_saldo:.2f}). Tekort aangevuld.")
            # Hier zou je kunnen kiezen om het tekort bij te passen of de simulatie te stoppen/aanpassen
            huidige_investering_saldo = 0 # Voor nu zetten we het op 0

        investering_data.append({
            "Maand": maand,
            "Saldo Investering": huidige_investering_saldo,
            "Maandelijkse Bijdrage/Onttrekking": verschil,
            "Cumulatieve Bijdrage Investering": cumulatieve_investering_bijdrage
        })
    df_investering = pd.DataFrame(investering_data)
    # Voeg de maandelijkse bijdragen toe als kolom
    # Zorg ervoor dat de lengte overeenkomt (als max_maand < len(bijdrage))
    df_investering['Maandelijkse Bijdrage/Onttrekking'] = pd.Series(maandelijkse_bijdrage[:max_maand])

    if not df_alternatief.empty:
        df_combined = pd.merge(df_alternatief,
                               df_investering,
                               on="Maand",
                               how="left")
    else:
        df_combined = df_investering
        for col in ['Resterend Kapitaal']:  # Add essential columns if missing
            if col not in df_combined.columns: df_combined[col] = 0
        # Voeg lege leningskolommen toe voor consistentie
        for col in df_referentie.columns:
            if col not in df_combined.columns:
                df_combined[col] = 0
      # Bereken Netto Vermogen = Saldo Investering - Resterend Kapitaal Lening
    df_combined["Netto Vermogen (Invest - Schuld)"] = df_combined["Saldo Investering"] - df_combined.get("Resterend Kapitaal", 0)
    # Return start_investering ook!
    return df_combined, start_investering


def bereken_statistieken(df_lening, df_investering=None, hoofdsom=0):
    """Berekent samenvattende statistieken voor lening en optionele investering."""
    stats = {}
    totale_kosten_lening = 0
    totale_rente = 0
    totale_ssv = 0
    start_inv = 0
    if not df_lening.empty:
        totale_rente = df_lening["Cumulatief Rente Betaald"].iloc[-1]
        totale_ssv = df_lening["Cumulatief SSV Betaald"].iloc[-1]
        totale_kosten_lening = totale_rente + totale_ssv
        stats["Totaal Kapitaal Betaald"] = round(df_lening["Cumulatief Kapitaal Betaald"].iloc[-1], 2)
        stats["Totale Rente Betaald"] = round(totale_rente, 2)
        stats["Totale SSV Premie Betaald"] = round(totale_ssv, 2)
        stats["Totale Kosten Lening (Rente + SSV)"] = round(totale_kosten_lening, 2)
        stats["Hoogste Maandelijkse Uitgave Lening"] = round(df_lening["Totale Maandelijkse Uitgave"].max(), 2)

    else: # Geen lening
        stats["Totaal Kapitaal Betaald"] = 0
        stats["Totale Rente Betaald"] = 0
        stats["Totale SSV Premie Betaald"] = 0
        stats["Totale Kosten Lening (Rente + SSV)"] = 0
        stats["Hoogste Maandelijkse Uitgave Lening"] = 0
    if df_investering is not None and isinstance(df_investering, pd.DataFrame) and not df_investering.empty and 'Saldo Investering' in df_investering.columns:
        # Alleen als df_investering geldig is, doe dan de berekeningen
        eindsaldo_investering = df_investering["Saldo Investering"].iloc[-1]
       
        # Controleer of de kolom 'Cumulatieve Bijdrage Investering' bestaat
        if "Cumulatieve Bijdrage Investering" in df_investering.columns:
            totale_bijdrage_investering = df_investering["Cumulatieve Bijdrage Investering"].iloc[-1]
            netto_groei_investering = eindsaldo_investering - totale_bijdrage_investering

            # Probeer start_inv op te halen, NU VEILIG BINNEN DE IF
            try:
                start_inv = df_investering["Cumulatieve Bijdrage Investering"].iloc[0]
            except IndexError:
                start_inv = 0 # Fallback als ophalen mislukt (bv. lege df na merge)
        stats["Start Investering"] = round(start_inv, 2)  # Approximation
        stats["Eindsaldo Investering"] = round(eindsaldo_investering, 2)
        stats["Netto Groei Investering"] = round(netto_groei_investering, 2)

        # Netto resultaat = Netto groei investering - Totale kosten lening
        netto_eindresultaat = netto_groei_investering - totale_kosten_lening
        stats["Netto Eindresultaat (Groei Invest - Kosten Lening)"] = round(netto_eindresultaat, 2)

        # Netto vermogen aan einde looptijd
        stats["Netto Vermogen Einde Looptijd (Invest - Schuld)"] = round(df_investering["Netto Vermogen (Invest - Schuld)"].iloc[-1], 2)

    return stats


