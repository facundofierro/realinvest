"use client";

import { Input } from "@repo/ui/components/ui/input";
import { Button } from "@repo/ui/components/ui/button";
import { Search, ArrowUpDown, TrendingUp, TrendingDown } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@repo/ui/components/ui/card";
import { Badge } from "@repo/ui/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@repo/ui/components/ui/tabs";

export default function ExchangePage() {
  return (
    <div className="p-4 space-y-6 min-h-screen pb-20">
        <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold tracking-tight">Exchange</h1>
            <Button variant="outline" size="icon">
                <ArrowUpDown className="h-4 w-4" />
            </Button>
        </div>

        <Tabs defaultValue="market" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="market">Mercado</TabsTrigger>
                <TabsTrigger value="positions">Mis Posiciones</TabsTrigger>
            </TabsList>
            
            <TabsContent value="market" className="space-y-4 pt-4">
                <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input type="search" placeholder="Buscar tokens..." className="pl-9 h-10" />
                </div>

                <div className="grid gap-3">
                    {[
                        { name: "LA-MZA-T1", price: "1.25", change: "+2.4%", trend: "up", project: "Los Álamos T1" },
                        { name: "HOR-ROS-T2", price: "0.98", change: "-0.5%", trend: "down", project: "Horizonte T2" },
                        { name: "VIV-BSAS-T1", price: "2.10", change: "+1.2%", trend: "up", project: "Vivero BSAS" },
                    ].map((token) => (
                        <Card key={token.name} className="hover:bg-muted/50 transition-colors cursor-pointer">
                            <CardContent className="p-4 flex items-center justify-between">
                                <div className="space-y-1">
                                    <div className="font-bold">{token.name}</div>
                                    <div className="text-xs text-muted-foreground">{token.project}</div>
                                </div>
                                <div className="text-right">
                                    <div className="font-bold">${token.price}</div>
                                    <div className={`text-xs flex items-center justify-end ${token.trend === 'up' ? 'text-emerald-500' : 'text-rose-500'}`}>
                                        {token.trend === 'up' ? <TrendingUp className="h-3 w-3 mr-1" /> : <TrendingDown className="h-3 w-3 mr-1" />}
                                        {token.change}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </TabsContent>

            <TabsContent value="positions" className="space-y-4 pt-4">
                <Card className="bg-primary/5 border-primary/20">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Valor Total de Posiciones</CardTitle>
                        <div className="text-2xl font-bold">$4,250.00</div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-xs text-emerald-600 font-medium flex items-center">
                            <TrendingUp className="h-3 w-3 mr-1" />
                            +$245.00 (5.8%) este mes
                        </div>
                    </CardContent>
                </Card>

                <div className="grid gap-3">
                    {[
                        { name: "LA-MZA-T1", amount: "1500", value: "1,875.00", roi: "+12%" },
                        { name: "VIV-BSAS-T1", amount: "1000", value: "2,100.00", roi: "+8%" },
                    ].map((pos) => (
                        <Card key={pos.name}>
                            <CardContent className="p-4 flex items-center justify-between">
                                <div className="space-y-1">
                                    <div className="font-bold">{pos.name}</div>
                                    <div className="text-xs text-muted-foreground">{pos.amount} tokens</div>
                                </div>
                                <div className="text-right">
                                    <div className="font-bold">${pos.value}</div>
                                    <Badge variant="secondary" className="text-[10px] bg-emerald-500/10 text-emerald-600 border-none">
                                        {pos.roi}
                                    </Badge>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </TabsContent>
        </Tabs>
    </div>
  )
}
