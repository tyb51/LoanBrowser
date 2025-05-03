export async function getDiagnosis() {
    try {
      const res = await fetch("http://localhost:4000/diagnosis");
      if (!res.ok) throw new Error("Failed to fetch data");

      const data = await res.json();

      // Get today's date
      const currentDate = new Date();
      const currentMonth = currentDate.getMonth() + 1; // Months are 0-based in JS
      const currentYear = currentDate.getFullYear();

      // Convert month names to numbers for easy filtering
      const monthMap: { [key: string]: number } = {
        January: 1, February: 2, March: 3, April: 4, May: 5, June: 6,
        July: 7, August: 8, September: 9, October: 10, November: 11, December: 12
      };

      // Get the last 6 months of data
      const last6Months = data.filter((entry: any) => {
        const entryMonth = monthMap[entry.month];
        const entryYear = entry.year;

        const monthDiff = (currentYear - entryYear) * 12 + (currentMonth - entryMonth);
        return monthDiff >= 0 && monthDiff < 6; // Only last 6 months
      });

      return last6Months;
    } catch (error) {
      console.error("Error fetching diagnosis history:", error);
      return [];
    }
  }