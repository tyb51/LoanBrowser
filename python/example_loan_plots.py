
import matplotlib.pyplot as plt
import seaborn as sns

# Zet een stijl voor de plots
sns.set(style="whitegrid")



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

# --- Basis Plot Functie (Hergebruik vorige versie) ---
# --- [HIER CODE VOOR plot_lening_simulatie Kopiëren] ---
def plot_lening_simulatie(df, titel):
    """Genereert een plot van het leningverloop."""
    if df.empty:
        print(f"DataFrame voor '{titel}' (lening) is leeg, kan niet plotten.")
        return

    fig, ax1 = plt.subplots(figsize=(12, 7))

    color = 'tab:red'
    ax1.set_xlabel('Maanden')
    ax1.set_ylabel('Resterend Kapitaal (€)', color=color)
    ax1.plot(df['Maand'], df['Resterend Kapitaal'], color=color, label='Resterend Kapitaal')
    ax1.tick_params(axis='y', labelcolor=color)
    ax1.yaxis.set_major_formatter(plt.FuncFormatter(lambda x, p: format(int(x), ',')))

    ax2 = ax1.twinx()  # Tweede y-as voor cumulatieve kosten
    color = 'tab:blue'
    ax2.set_ylabel('Cumulatieve Kosten (€)', color=color)
    ax2.plot(df['Maand'], df['Cumulatief Rente Betaald'] + df['Cumulatief SSV Betaald'], color=color, linestyle='--', label='Cumul. Kosten (Rente+SSV)')
    # Optioneel: aparte lijnen voor rente en SSV
    # ax2.plot(df['Maand'], df['Cumulatief Rente Betaald'], color='orange', linestyle=':', label='Cumul. Rente')
    # ax2.plot(df['Maand'], df['Cumulatief SSV Betaald'], color='purple', linestyle=':', label='Cumul. SSV')
    ax2.tick_params(axis='y', labelcolor=color)
    ax2.yaxis.set_major_formatter(plt.FuncFormatter(lambda x, p: format(int(x), ',')))


    fig.tight_layout()
    plt.title(f"{titel}\nLening Verloop", fontsize=14)
    # Combineer legends
    lines, labels = ax1.get_legend_handles_labels()
    lines2, labels2 = ax2.get_legend_handles_labels()
    ax2.legend(lines + lines2, labels + labels2, loc='center left')
    plt.grid(True)
    plt.show()
    
def plot_vergelijking_met_investering(df_combined, titel_alternatief, titel_referentie):
    """Genereert een plot die lening vergelijkt met investering."""
    if df_combined.empty:
        print(f"DataFrame voor '{titel_alternatief}' (gecombineerd) is leeg, kan niet plotten.")
        return

    plt.figure(figsize=(12, 7))

    # Lijn 1: Saldo Investering
    plt.plot(df_combined['Maand'], df_combined['Saldo Investering'], label=f'Saldo Investering (@{JAARLIJKSE_GROEI_INVESTERING*100:.1f}% p.j.)', color='green')

    # Lijn 2: Resterend Kapitaal Alternatieve Lening
    plt.plot(df_combined['Maand'], df_combined.get('Resterend Kapitaal', 0), label=f'Resterende Schuld ({titel_alternatief})', color='red', linestyle='--')

    # Lijn 3: Netto Vermogen (Investering - Schuld)
    plt.plot(df_combined['Maand'], df_combined['Netto Vermogen (Invest - Schuld)'], label='Netto Vermogen (Investering - Schuld)', color='blue', linestyle='-.')

    plt.title(f"Vergelijking: {titel_alternatief} vs {titel_referentie}\nmet Alternatieve Investering", fontsize=14)
    plt.xlabel("Maanden")
    plt.ylabel("Euro (€)")
    plt.legend()
    plt.grid(True)
    ax = plt.gca()
    ax.yaxis.set_major_formatter(plt.FuncFormatter(lambda x, p: format(int(x), ',')))
    plt.tight_layout()
    plt.show()
    
