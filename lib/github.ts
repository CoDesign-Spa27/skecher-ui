const REPO = "CoDesign-Spa27/skecher-ui";

export async function fetchStarCount() {
  try {
    const res = await fetch(`https://api.github.com/repos/${REPO}`, {
      next: { revalidate: 21_600 },
    });

    if (!res.ok) {
      return null;
    }

    const data = await res.json();
    return (data.stargazers_count as number) ?? null;
  } catch {
    return null;
  }
}
