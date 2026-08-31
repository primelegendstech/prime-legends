import Link from "next/link";
import { buscarPedidosAdmin } from "@/lib/admin-pedidos";
import FiltrosPedidos from "./FiltrosPedidos";
import PedidoCard from "./PedidoCard";

const POR_PAGINA = 25;

export default async function AdminPedidosPage({
  searchParams,
}: {
  searchParams: Promise<{ tipo?: string; status?: string; busca?: string; pagina?: string }>;
}) {
  const params = await searchParams;
  const pagina = Number(params.pagina) || 1;

  const { pedidos, total } = await buscarPedidosAdmin({
    tipo: (params.tipo as any) || "todos",
    status: (params.status as any) || "todos",
    busca: params.busca || "",
    pagina,
    porPagina: POR_PAGINA,
  });

  const totalPaginas = Math.max(1, Math.ceil(total / POR_PAGINA));

  function linkPagina(p: number) {
    const sp = new URLSearchParams();
    if (params.tipo) sp.set("tipo", params.tipo);
    if (params.status) sp.set("status", params.status);
    if (params.busca) sp.set("busca", params.busca);
    sp.set("pagina", String(p));
    return `/admin/pedidos?${sp.toString()}`;
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <h2 className="text-white font-bold">Pedidos</h2>
        <p className="text-gray-500 text-xs">{total} resultado{total !== 1 ? "s" : ""}</p>
      </div>
      <p className="text-gray-500 text-sm mb-4">Aluguéis, licenças e métodos, num só lugar.</p>

      <FiltrosPedidos />

      {pedidos.length === 0 ? (
        <div className="rounded-xl border border-yellow-500/20 bg-white/[0.03] p-6 text-center">
          <p className="text-gray-400 text-sm">Nenhum pedido encontrado com esses filtros.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {pedidos.map((p) => (
            <PedidoCard key={`${p.tipo}-${p.id}`} pedido={p} />
          ))}
        </div>
      )}

      {totalPaginas > 1 && (
        <div className="flex items-center justify-center gap-2 mt-6">
          {pagina > 1 && (
            <Link href={linkPagina(pagina - 1)} className="text-xs font-semibold px-3 py-2 rounded-lg border border-white/10 text-gray-300 hover:border-white/25">
              ← Anterior
            </Link>
          )}
          <span className="text-xs text-gray-500">
            Página {pagina} de {totalPaginas}
          </span>
          {pagina < totalPaginas && (
            <Link href={linkPagina(pagina + 1)} className="text-xs font-semibold px-3 py-2 rounded-lg border border-white/10 text-gray-300 hover:border-white/25">
              Próxima →
            </Link>
          )}
        </div>
      )}
    </div>
  );
}
