import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { ShieldCheck, XCircle } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { cancelSubscription } from "@/services/stripeService";

export default function Subscription() {
  const [isCancelling, setIsCancelling] = useState(false);
  const [status, setStatus] = useState<'active' | 'cancelled'>('active');

  const handleCancelSubscription = async () => {
    setIsCancelling(true);
    toast.info("Processando cancelamento...");
    try {
      await cancelSubscription();
      toast.success("Assinatura cancelada com sucesso. Você terá acesso até o fim do período de faturamento.");
      setStatus('cancelled');
    } catch (error) {
      toast.error("Ocorreu um erro ao cancelar a assinatura. Tente novamente.");
    } finally {
      setIsCancelling(false);
    }
  };

  return (
    <div className="p-6">
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            {status === 'active' ? (
              <ShieldCheck className="w-6 h-6 text-green-600" />
            ) : (
              <XCircle className="w-6 h-6 text-red-600" />
            )}
            <span>Gerenciar Assinatura</span>
          </CardTitle>
          <CardDescription>
            Aqui você pode visualizar o status da sua assinatura e fazer alterações.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {status === 'active' ? (
              <div className="flex items-center justify-between p-4 bg-green-50 border border-green-200 rounded-lg">
                <div>
                  <p className="font-semibold text-green-800">Status da Assinatura</p>
                  <p className="text-sm text-green-700">Todos os seus benefícios estão ativos.</p>
                </div>
                <Badge variant="success" className="bg-green-600 text-white">Ativa</Badge>
              </div>
            ) : (
              <div className="flex items-center justify-between p-4 bg-red-50 border border-red-200 rounded-lg">
                <div>
                  <p className="font-semibold text-red-800">Status da Assinatura</p>
                  <p className="text-sm text-red-700">Sua assinatura foi cancelada. O acesso permanecerá até o fim do ciclo.</p>
                </div>
                <Badge variant="destructive">Cancelada</Badge>
              </div>
            )}
            <p className="text-sm text-gray-600">
              Sua assinatura garante acesso a todas as funcionalidades do sistema, incluindo gestão de clientes,
              vendas, relatórios e muito mais. Agradecemos por fazer parte da nossa comunidade!
            </p>
            <p className="text-sm text-red-600">
              Importante: se você já cancelou sua assinatura, você ainda terá acesso às funcionalidades do sistema até o final do ciclo de cobrança atual.
            </p>
          </div>
        </CardContent>
        <CardFooter className="border-t pt-6">
          <div className="w-full">
            <p className="text-sm text-gray-800 font-semibold mb-2">Cancelar Assinatura</p>
            <p className="text-xs text-gray-600 mb-4">
              Ao cancelar, você perderá o acesso às funcionalidades Pro no final do seu ciclo de faturamento atual.
              Esta ação não pode ser desfeita.
            </p>
            {status === 'active' ? (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive" disabled={isCancelling}>
                    {isCancelling ? "Cancelando..." : "Cancelar Assinatura"}
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Você tem certeza?</AlertDialogTitle>
                    <AlertDialogDescription>
                      Iremos te redirecionar para a página de cancelamento da Stripe. Após confirmar, sua assinatura será cancelada
                      e você perderá o acesso às funcionalidades no final do ciclo de faturamento atual.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Voltar</AlertDialogCancel>
                    <AlertDialogAction onClick={handleCancelSubscription} disabled={isCancelling}>
                      Confirmar Cancelamento
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            ) : (
              <Button variant="destructive" disabled>
                Assinatura já Cancelada
              </Button>
            )}
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
