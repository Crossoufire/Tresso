const boardGradients = [
    "bg-gradient-to-br from-slate-900 to-indigo-900",
    "bg-gradient-to-br from-gray-900 to-blue-900",
    "bg-gradient-to-br from-slate-800 to-emerald-900",
    "bg-gradient-to-br from-gray-900 to-red-900",
    "bg-gradient-to-br from-slate-900 to-purple-900",
    "bg-gradient-to-br from-gray-800 to-orange-900",
    "bg-gradient-to-br from-slate-900 to-teal-900",
    "bg-gradient-to-br from-gray-900 to-rose-900",
    "bg-gradient-to-br from-slate-800 to-cyan-900",
    "bg-gradient-to-br from-gray-900 to-orange-800",
    "bg-gradient-to-br from-slate-900 to-green-900",
    "bg-gradient-to-br from-gray-800 to-violet-900",
    "bg-gradient-to-br from-slate-900 to-amber-900",
    "bg-gradient-to-br from-gray-900 to-fuchsia-900",
    "bg-gradient-to-br from-slate-800 to-blue-900",
    "bg-gradient-to-br from-gray-900 to-emerald-800",
]


export const getBoardGradient = (boardId: number, idx: number) => {
    const hash = boardId.toString().split("").reduce((a, b) => {
        a = (a << 5) - a + b.charCodeAt(0);
        return a & a;
    }, 0);
    const gradientIndex = Math.abs(hash) % boardGradients.length;

    return boardGradients[gradientIndex] || boardGradients[idx % boardGradients.length];
}
