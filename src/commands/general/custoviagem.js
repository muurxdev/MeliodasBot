/**
 * Comando .custoviagem — Calcula o custo em reais de uma viagem de carro: .custoviagem <distancia_km> <km_por_l> <preco_combustivel>
 */
module.exports = {
    name: "custoviagem",
    aliases: [],
    category: "general",
    subcategory: "Finanças",
    description: "Calcula o custo em reais de uma viagem de carro: .custoviagem <distancia_km> <km_por_l> <preco_combustivel>",
    cooldownMs: 1500,
    execute: async ({ reply, args }) => {
            if (args.length < 3) return reply("🚗⛽ Uso: `.custoviagem <distancia_km> <consumo_km_por_litro> <preco_litro>`\nEx: `.custoviagem 350 12 5.80`");
            const d = parseFloat(args[0]), c = parseFloat(args[1]), p = parseFloat(args[2]);
            if (isNaN(d) || isNaN(c) || isNaN(p) || c <= 0) return reply("❌ Valores numéricos inválidos.");
            const litros = d / c;
            const custo = litros * p;
            return reply(`🗺️ *Estimativa de Custo de Viagem:*\n▫️ Distância: ${d} km\n▫️ Litros necessários: ${litros.toFixed(1)} L\n▫️ *Custo Total Estimado:* *R$ ${custo.toFixed(2)}*`);
        }
};
