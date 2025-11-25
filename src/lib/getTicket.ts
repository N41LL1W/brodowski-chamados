export async function getTicket(id: string) {
  const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/tickets/${id}`, {
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error("Erro ao buscar ticket");
  }

  return res.json();
}
