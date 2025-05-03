# -*- coding: utf-8 -*-
# Stap 1: Imports (voeg scipy toe)
import numpy as np
import pandas as pd
import numpy_financial as npf
from scipy import optimize # Voor root finding



# --- Constanten (identiek) ---
INVESTMENT_BALANCE = 120000
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

        # Output only canonical (enum-based) field names
        data.append({
            "month": maand,
            "year": simulatie_jaar,
            "paymentExcludingInsurance": betaling_lening_excl_ssv,
            "interest": rente_deze_maand,
            "principalPayment": kapitaal_deze_maand,
            "insurancePremium": maandelijkse_ssv,
            "totalMonthlyPayment": totale_maandelijkse_uitgave,
            "remainingPrincipal": resterend_kapitaal,
            "cumulativePrincipalPaid": cumulatief_kapitaal_betaald,
            "cumulativeInterestPaid": cumulatief_rente_betaald,
            "cumulativeInsurancePaid": cumulatief_ssv_betaald,
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

        # Output only canonical (enum-based) field names
        data.append({
            "month": maand,
            "year": simulatie_jaar,
            "paymentExcludingInsurance": betaling_lening_excl_ssv,
            "interest": rente_deze_maand,
            "principalPayment": kapitaal_deze_maand,
            "insurancePremium": maandelijkse_ssv,
            "totalMonthlyPayment": totale_maandelijkse_uitgave,
            "remainingPrincipal": resterend_kapitaal,
            "cumulativePrincipalPaid": cumulatief_kapitaal_betaald,
            "cumulativeInterestPaid": cumulatief_rente_betaald,
            "cumulativeInsurancePaid": cumulatief_ssv_betaald,
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

    jaarlijkse_data = df_maandelijks.groupby('year').agg(
        annualInterest=('interest', 'sum'),
        annualPrincipal=('principalPayment', 'sum'),
        annualInsurance=('insurancePremium', 'sum'),
        annualTotalPayment=('totalMonthlyPayment', 'sum'),
        remainingPrincipalYearEnd=('remainingPrincipal', 'last'),
        cumulativeInterestYearEnd=('cumulativeInterestPaid', 'last'),
        cumulativeInsuranceYearEnd=('cumulativeInsurancePaid', 'last'),
        cumulativePrincipalYearEnd=('cumulativePrincipalPaid', 'last')
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
    vergelijk_df['year'] = merged_df['month']

    # Bereken verschillen (Alternatief - Referentie)
    cols_to_compare = ['annualInterest', 'annualPrincipal', 'annualInsurance',
                       'annualTotalPayment', 'remainingPrincipalYearEnd']

    for col in cols_to_compare:
        col_ref = f"{col}_{naam_ref}"
        col_alt = f"{col}_{naam_alt}"
        vergelijk_df[f'Verschil_{col}'] = merged_df[col_alt] - merged_df[col_ref]

    return vergelijk_df



# --- Stap W: Functie: Minimale Groei Berekening ---
def bereken_min_groei_voor_betaling(
    df_combined, # Resultaat van simuleer_met_investering
    payment_maand,
    payment_bedrag,
    start_investering # Initieel geïnvesteerd kapitaal
    ):
    """Berekent de minimaal benodigde jaarlijkse groei om een betaling te halen."""
    if df_combined.empty or 'monthlyContribution' not in df_combined.columns:
        print("Kan minimale groei niet berekenen: investeringsdata ontbreekt.")
        return None
    
    print(df_combined) # Debug: Bekijk de eerste paar rijen van de dataframe
    # Haal maandelijkse bijdragen op tot de betalingsmaand
    contributions = df_combined[df_combined['month'] <= payment_maand]['monthlyContribution'].values
    # De *eerste* bijdrage in df_combined is het verschil in maand 1.
    # De start_investering is het bedrag *voor* maand 1.
    # Functie die de eindwaarde berekent gegeven een *maandelijkse* groei rate 'r'
    def calculate_future_value(monthly_rate):
        r = monthly_rate
        if r <= -1: # Voorkom delen door nul of negatieve basis
            print(f"DEBUG: Ongeldige maandelijkse groei rate r={r}")
            return -np.inf # Ongeldige rate
        try:
            fv = start_investering * (1 + r)**payment_maand
        except Exception as e:
            print(f"DEBUG: Fout bij berekenen van start_investering * (1 + r)^{payment_maand}: {e}")
            return np.nan

        # Voeg future value van elke maandelijkse bijdrage toe
        # Bijdrage C_i (in maand i) groeit voor (payment_maand - i) maanden
        for i in range(len(contributions)):
             maand = i + 1 # Maand nummer (1-based)
             periods_to_grow = payment_maand - maand
             if periods_to_grow >= 0:
                 try:
                     fv += contributions[i] * (1 + r)**periods_to_grow
                 except Exception as e:
                     print(f"DEBUG: Fout bij bijdrage[{i}] ({contributions[i]}) * (1 + r)^{periods_to_grow}: {e}")
                     return np.nan
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
    df_referentie,  # DataFrame van de 'basis' lening (bv. Klassiek)
    df_alternatief,  # DataFrame van de alternatieve lening (bv. Bullet)
    eigen_inbreng_referentie,
    eigen_inbreng_alternatief,
    start_kapitaal_totaal=INVESTMENT_BALANCE,
    maandelijkse_groei_investering=MAANDELIJKSE_GROEI_INVESTERING,
    invest_kapitaal_referentie=None,
    invest_kapitaal_alternatief=None,
):
    """
    Vergelijkt twee leningen en simuleert investering van vrijgekomen cash.
    Ondersteunt verschillende eigen inbreng en optioneel overschrijven van startkapitaal voor referentie en alternatief.
    """

    # Bepaal initieel te investeren kapitaal voor referentie en alternatief
    if invest_kapitaal_referentie is not None:
        start_investering_ref = invest_kapitaal_referentie
    else:
        start_investering_ref = start_kapitaal_totaal - (eigen_inbreng_referentie if eigen_inbreng_referentie is not None else 0)
        if start_investering_ref < 0:
            print("Waarschuwing: Eigen inbreng referentie > startkapitaal. Start investering referentie = 0.")
            start_investering_ref = 0

    if invest_kapitaal_alternatief is not None:
        start_investering_alt = invest_kapitaal_alternatief
    else:
        start_investering_alt = start_kapitaal_totaal - (eigen_inbreng_alternatief if eigen_inbreng_alternatief is not None else 0)
        if start_investering_alt < 0:
            print("Waarschuwing: Eigen inbreng alternatief > startkapitaal. Start investering alternatief = 0.")
            start_investering_alt = 0

    # Zorg dat beide dataframes dezelfde maximale maand hebben voor vergelijking
    max_maand = max(
        df_referentie['month'].max() if not df_referentie.empty else 0,
        df_alternatief['month'].max() if not df_alternatief.empty else 0
    )

    # Voeg totale maandelijkse uitgave toe als die mist (voor lege DFs)
    if 'totalMonthlyPayment' not in df_referentie.columns:
        df_referentie['totalMonthlyPayment'] = 0
    if 'totalMonthlyPayment' not in df_alternatief.columns:
        df_alternatief['totalMonthlyPayment'] = 0

    # Maak DataFrames met maand als index voor makkelijke lookup
    ref_uitgaven = df_referentie.set_index('month')['totalMonthlyPayment']
    alt_uitgaven = df_alternatief.set_index('month')['totalMonthlyPayment']

    # Simuleer investering voor referentie (stel: je kiest voor referentie lening, investeer je start_investering_ref)
    investering_data_ref = []
    huidige_investering_saldo_ref = start_investering_ref
    cumulatieve_investering_bijdrage_ref = start_investering_ref
    for maand in range(1, max_maand + 1):
        huidige_investering_saldo_ref *= (1 + maandelijkse_groei_investering)
        # Referentie: geen verschil in uitgaven, dus geen maandelijkse bijdrage/onttrekking
        investering_data_ref.append({
            "month": maand,
            "investmentBalance": huidige_investering_saldo_ref,
            "monthlyContribution": 0,
            "cumulativeInvestmentContribution": cumulatieve_investering_bijdrage_ref
        })
    df_investering_ref = pd.DataFrame(investering_data_ref)

    # Simuleer investering voor alternatief (stel: je kiest voor alternatief, investeer je start_investering_alt)
    investering_data_alt = []
    huidige_investering_saldo_alt = start_investering_alt
    cumulatieve_investering_bijdrage_alt = start_investering_alt
    for maand in range(1, max_maand + 1):
        huidige_investering_saldo_alt *= (1 + maandelijkse_groei_investering)
        # Alternatief: verschil in maandlasten t.o.v. referentie wordt toegevoegd/onttrokken
        uitgave_ref = ref_uitgaven.get(maand, 0)
        uitgave_alt = alt_uitgaven.get(maand, 0)
        verschil = uitgave_ref - uitgave_alt  # Positief als alternatief goedkoper is
        huidige_investering_saldo_alt += verschil
        cumulatieve_investering_bijdrage_alt += verschil
        if huidige_investering_saldo_alt < 0:
            huidige_investering_saldo_alt = 0
        investering_data_alt.append({
            "month": maand,
            "investmentBalance": huidige_investering_saldo_alt,
            "monthlyContribution": verschil,
            "cumulativeInvestmentContribution": cumulatieve_investering_bijdrage_alt
        })
    df_investering_alt = pd.DataFrame(investering_data_alt)

    # Combineer met alternatieve lening voor output (zoals voorheen)
    if not df_alternatief.empty:
        df_combined = pd.merge(
            df_alternatief,
            df_investering_alt,
            on="month",
            how="left"
        )
    else:
        df_combined = df_investering_alt
        for col in ['remainingPrincipal']:
            if col not in df_combined.columns:
                df_combined[col] = 0
        for col in df_referentie.columns:
            if col not in df_combined.columns:
                df_combined[col] = 0

    # Netto vermogen = investeringssaldo - resterend kapitaal lening
    df_combined["netWorth"] = df_combined["investmentBalance"] - df_combined.get("remainingPrincipal", 0)

    # Return: (1) gecombineerde alternatieve simulatie, (2) start_investering_alt, (3) referentie investeringspad, (4) start_investering_ref
    # Dit maakt het mogelijk om beide scenario's te tonen
    return df_combined, start_investering_alt, df_investering_ref, start_investering_ref


def bereken_statistieken(df_lening, df_investering=None, hoofdsom=0):
    """Berekent samenvattende statistieken voor lening en optionele investering."""
    stats = {}
    total_loan_costs = 0
    total_interest = 0
    total_insurance = 0
    start_inv = 0
    if not df_lening.empty:
        total_interest = df_lening["cumulativeInterestPaid"].iloc[-1]
        total_insurance = df_lening["cumulativeInsurancePaid"].iloc[-1]
        total_loan_costs = total_interest + total_insurance
        stats["totalPrincipalPaid"] = round(df_lening["cumulativePrincipalPaid"].iloc[-1], 2)
        stats["totalInterestPaid"] = round(total_interest, 2)
        stats["totalInsurancePaid"] = round(total_insurance, 2)
        stats["totalLoanCosts"] = round(total_loan_costs, 2)
        stats["highestMonthlyPayment"] = round(df_lening["totalMonthlyPayment"].max(), 2)
    else:  # No loan
        stats["totalPrincipalPaid"] = 0
        stats["totalInterestPaid"] = 0
        stats["totalInsurancePaid"] = 0
        stats["totalLoanCosts"] = 0
        stats["highestMonthlyPayment"] = 0

    # Investment statistics (if present)
    if (
        df_investering is not None
        and isinstance(df_investering, pd.DataFrame)
        and not df_investering.empty
        and "investmentBalance" in df_investering.columns
    ):
        end_investment_balance = df_investering["investmentBalance"].iloc[-1]

        # Check if the column 'cumulativeInvestmentContribution' exists
        if "cumulativeInvestmentContribution" in df_investering.columns:
            total_investment_contribution = df_investering["cumulativeInvestmentContribution"].iloc[-1]
            net_investment_growth = end_investment_balance - total_investment_contribution

            # Try to get start_inv safely
            try:
                start_inv = df_investering["cumulativeInvestmentContribution"].iloc[0]
            except IndexError:
                start_inv = 0  # Fallback if retrieval fails (e.g., empty df after merge)
        else:
            net_investment_growth = 0

        stats["startInvestment"] = round(start_inv, 2)
        stats["endInvestmentBalance"] = round(end_investment_balance, 2)
        stats["netInvestmentGrowth"] = round(net_investment_growth, 2)

        # Net result = Net investment growth - total loan costs
        net_final_result = net_investment_growth - total_loan_costs
        stats["netFinalResult"] = round(net_final_result, 2)

        # Net worth at end of term
        if "netWorth" in df_investering.columns:
            stats["netWorthEndOfTerm"] = round(df_investering["netWorth"].iloc[-1], 2)

    return stats
