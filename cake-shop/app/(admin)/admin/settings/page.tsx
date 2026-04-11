"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ImageUploader } from "@/components/admin/ImageUploader";

interface SettingsForm {
  siteName: string;
  tagline: string;
  favicon: string;
  seo: {
    defaultTitle: string;
    defaultDescription: string;
    ogImage: string;
  };
  theme: {
    primaryColor: string;
    secondaryColor: string;
    accentColor: string;
    fontHeading: string;
    fontBody: string;
  };
  maintenance: {
    isEnabled: boolean;
    message: string;
  };
  emailNotifications: {
    enabled: boolean;
    adminEmail: string;
    orderConfirmation: { enabled: boolean; subject: string };
    adminOrderAlert: { enabled: boolean; subject: string };
    orderStatusUpdate: { enabled: boolean; subject: string };
  };
  paymentGateways: {
    razorpay: { enabled: boolean; displayName: string; keyId: string; keySecret: string };
    stripe: { enabled: boolean; displayName: string; publishableKey: string; secretKey: string };
    cod: { enabled: boolean; displayName: string; instructions: string };
    bankTransfer: { enabled: boolean; displayName: string; instructions: string; accountDetails: string };
  };
}

export default function SettingsPage() {
  const [loading, setLoading] = useState(true);

  const { register, handleSubmit, setValue, watch, reset } =
    useForm<SettingsForm>({
      defaultValues: {
        siteName: "Sweet Delights Bakery",
        tagline: "",
        favicon: "",
        seo: {
          defaultTitle: "",
          defaultDescription: "",
          ogImage: "",
        },
        theme: {
          primaryColor: "#D4A574",
          secondaryColor: "#8B4513",
          accentColor: "#F5E6D3",
          fontHeading: "Playfair Display",
          fontBody: "Lato",
        },
        maintenance: {
          isEnabled: false,
          message: "We'll be back soon!",
        },
        emailNotifications: {
          enabled: false,
          adminEmail: "",
          orderConfirmation: { enabled: true, subject: "Your order {{orderId}} has been confirmed!" },
          adminOrderAlert: { enabled: true, subject: "New order received: {{orderId}}" },
          orderStatusUpdate: { enabled: true, subject: "Your order {{orderId}} status update" },
        },
        paymentGateways: {
          razorpay: { enabled: true, displayName: "Razorpay", keyId: "", keySecret: "" },
          stripe: { enabled: false, displayName: "Stripe", publishableKey: "", secretKey: "" },
          cod: { enabled: false, displayName: "Cash on Delivery", instructions: "Pay when your order is delivered." },
          bankTransfer: { enabled: false, displayName: "Bank Transfer", instructions: "Transfer the amount to our bank account.", accountDetails: "" },
        },
      },
    });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const resetWithDefaults = (d: any) => {
    reset({
      ...d,
      maintenance: {
        isEnabled: d.maintenance?.isEnabled ?? false,
        message: d.maintenance?.message ?? "We'll be back soon!",
      },
      emailNotifications: {
        enabled: d.emailNotifications?.enabled ?? false,
        adminEmail: d.emailNotifications?.adminEmail ?? "",
        orderConfirmation: {
          enabled: d.emailNotifications?.orderConfirmation?.enabled ?? true,
          subject: d.emailNotifications?.orderConfirmation?.subject ?? "Your order {{orderId}} has been confirmed!",
        },
        adminOrderAlert: {
          enabled: d.emailNotifications?.adminOrderAlert?.enabled ?? true,
          subject: d.emailNotifications?.adminOrderAlert?.subject ?? "New order received: {{orderId}}",
        },
        orderStatusUpdate: {
          enabled: d.emailNotifications?.orderStatusUpdate?.enabled ?? true,
          subject: d.emailNotifications?.orderStatusUpdate?.subject ?? "Your order {{orderId}} status update",
        },
      },
      paymentGateways: {
        razorpay: { enabled: d.paymentGateways?.razorpay?.enabled ?? true, displayName: d.paymentGateways?.razorpay?.displayName ?? "Razorpay", keyId: d.paymentGateways?.razorpay?.keyId ?? "", keySecret: d.paymentGateways?.razorpay?.keySecret ?? "" },
        stripe: { enabled: d.paymentGateways?.stripe?.enabled ?? false, displayName: d.paymentGateways?.stripe?.displayName ?? "Stripe", publishableKey: d.paymentGateways?.stripe?.publishableKey ?? "", secretKey: d.paymentGateways?.stripe?.secretKey ?? "" },
        cod: { enabled: d.paymentGateways?.cod?.enabled ?? false, displayName: d.paymentGateways?.cod?.displayName ?? "Cash on Delivery", instructions: d.paymentGateways?.cod?.instructions ?? "Pay when your order is delivered." },
        bankTransfer: { enabled: d.paymentGateways?.bankTransfer?.enabled ?? false, displayName: d.paymentGateways?.bankTransfer?.displayName ?? "Bank Transfer", instructions: d.paymentGateways?.bankTransfer?.instructions ?? "Transfer the amount to our bank account.", accountDetails: d.paymentGateways?.bankTransfer?.accountDetails ?? "" },
      },
    });
  };

  useEffect(() => {
    fetch("/api/admin/settings")
      .then((r) => r.json())
      .then((res) => {
        if (res.success && res.data) resetWithDefaults(res.data);
      })
      .catch(() => toast.error("Failed to load settings"))
      .finally(() => setLoading(false));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reset]);

  const onSubmit = async (data: SettingsForm) => {
    try {
      const res = await fetch("/api/admin/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const result = await res.json();
      if (!res.ok) throw new Error();
      if (result.data) resetWithDefaults(result.data);
      toast.success("Settings saved");
    } catch {
      toast.error("Failed to save settings");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <div>
        <h2 className="font-heading text-2xl font-bold">Site Settings</h2>
        <p className="text-muted-foreground">
          Configure global site settings
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* General */}
        <Card>
          <CardHeader>
            <CardTitle>General</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label>Site Name</Label>
                <Input {...register("siteName")} />
              </div>
              <div>
                <Label>Tagline</Label>
                <Input {...register("tagline")} />
              </div>
            </div>
            <div>
              <Label>Favicon</Label>
              <ImageUploader
                value={watch("favicon")}
                onChange={(url) => setValue("favicon", url)}
                folder="branding"
              />
            </div>
          </CardContent>
        </Card>

        {/* SEO */}
        <Card>
          <CardHeader>
            <CardTitle>SEO Defaults</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Default Title</Label>
              <Input {...register("seo.defaultTitle")} />
            </div>
            <div>
              <Label>Default Description</Label>
              <Textarea {...register("seo.defaultDescription")} rows={2} />
            </div>
            <div>
              <Label>OG Image</Label>
              <ImageUploader
                value={watch("seo.ogImage")}
                onChange={(url) => setValue("seo.ogImage", url)}
                folder="branding"
              />
            </div>
          </CardContent>
        </Card>

        {/* Theme */}
        <Card>
          <CardHeader>
            <CardTitle>Theme Colors</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-3">
              <div>
                <Label>Primary Color</Label>
                <div className="flex items-center gap-2">
                  <Input
                    type="color"
                    value={watch("theme.primaryColor")}
                    onChange={(e) => setValue("theme.primaryColor", e.target.value)}
                    className="h-10 w-14 cursor-pointer p-1"
                  />
                  <Input
                    value={watch("theme.primaryColor")}
                    onChange={(e) => setValue("theme.primaryColor", e.target.value)}
                    className="flex-1"
                  />
                </div>
              </div>
              <div>
                <Label>Secondary Color</Label>
                <div className="flex items-center gap-2">
                  <Input
                    type="color"
                    value={watch("theme.secondaryColor")}
                    onChange={(e) => setValue("theme.secondaryColor", e.target.value)}
                    className="h-10 w-14 cursor-pointer p-1"
                  />
                  <Input
                    value={watch("theme.secondaryColor")}
                    onChange={(e) => setValue("theme.secondaryColor", e.target.value)}
                    className="flex-1"
                  />
                </div>
              </div>
              <div>
                <Label>Accent Color</Label>
                <div className="flex items-center gap-2">
                  <Input
                    type="color"
                    value={watch("theme.accentColor")}
                    onChange={(e) => setValue("theme.accentColor", e.target.value)}
                    className="h-10 w-14 cursor-pointer p-1"
                  />
                  <Input
                    value={watch("theme.accentColor")}
                    onChange={(e) => setValue("theme.accentColor", e.target.value)}
                    className="flex-1"
                  />
                </div>
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label>Heading Font</Label>
                <Input {...register("theme.fontHeading")} />
              </div>
              <div>
                <Label>Body Font</Label>
                <Input {...register("theme.fontBody")} />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Maintenance */}
        <Card>
          <CardHeader>
            <CardTitle>Maintenance Mode</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-3">
              <Switch
                checked={watch("maintenance.isEnabled")}
                onCheckedChange={(checked) =>
                  setValue("maintenance.isEnabled", !!checked)
                }
              />
              <div>
                <Label>Enable Maintenance Mode</Label>
                <p className="text-sm text-muted-foreground">
                  When enabled, visitors will see a maintenance page
                </p>
              </div>
            </div>
            <div>
              <Label>Maintenance Message</Label>
              <Textarea {...register("maintenance.message")} rows={2} />
            </div>
          </CardContent>
        </Card>

        {/* Email Notifications */}
        <Card>
          <CardHeader>
            <CardTitle>Email Notifications</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center gap-3">
              <Switch
                checked={watch("emailNotifications.enabled")}
                onCheckedChange={(checked) =>
                  setValue("emailNotifications.enabled", !!checked)
                }
              />
              <div>
                <Label>Enable Email Notifications</Label>
                <p className="text-sm text-muted-foreground">
                  Send emails for order events to customers and admin
                </p>
              </div>
            </div>

            {watch("emailNotifications.enabled") && (
              <div className="space-y-4 pt-2 border-t">
                <div>
                  <Label>Admin Email (receives order alerts)</Label>
                  <Input
                    type="email"
                    placeholder="admin@example.com"
                    {...register("emailNotifications.adminEmail")}
                  />
                </div>

                {/* Order Confirmation */}
                <div className="rounded-lg border p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Order Confirmation</p>
                      <p className="text-sm text-muted-foreground">Send to customer after order is placed</p>
                    </div>
                    <Switch
                      checked={watch("emailNotifications.orderConfirmation.enabled")}
                      onCheckedChange={(c) =>
                        setValue("emailNotifications.orderConfirmation.enabled", !!c)
                      }
                    />
                  </div>
                  {watch("emailNotifications.orderConfirmation.enabled") && (
                    <div>
                      <Label>Subject Line</Label>
                      <Input {...register("emailNotifications.orderConfirmation.subject")} />
                    </div>
                  )}
                </div>

                {/* Admin Order Alert */}
                <div className="rounded-lg border p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Admin Order Alert</p>
                      <p className="text-sm text-muted-foreground">Notify admin when a new order is received</p>
                    </div>
                    <Switch
                      checked={watch("emailNotifications.adminOrderAlert.enabled")}
                      onCheckedChange={(c) =>
                        setValue("emailNotifications.adminOrderAlert.enabled", !!c)
                      }
                    />
                  </div>
                  {watch("emailNotifications.adminOrderAlert.enabled") && (
                    <div>
                      <Label>Subject Line</Label>
                      <Input {...register("emailNotifications.adminOrderAlert.subject")} />
                    </div>
                  )}
                </div>

                {/* Order Status Update */}
                <div className="rounded-lg border p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Order Status Update</p>
                      <p className="text-sm text-muted-foreground">Notify customer when order status changes</p>
                    </div>
                    <Switch
                      checked={watch("emailNotifications.orderStatusUpdate.enabled")}
                      onCheckedChange={(c) =>
                        setValue("emailNotifications.orderStatusUpdate.enabled", !!c)
                      }
                    />
                  </div>
                  {watch("emailNotifications.orderStatusUpdate.enabled") && (
                    <div>
                      <Label>Subject Line</Label>
                      <Input {...register("emailNotifications.orderStatusUpdate.subject")} />
                    </div>
                  )}
                </div>

                <p className="text-xs text-muted-foreground">
                  Use <code>{"{{orderId}}"}</code> and <code>{"{{status}}"}</code> as placeholders in subject lines.
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Payment Gateways */}
        <Card>
          <CardHeader>
            <CardTitle>Payment Gateways</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Razorpay */}
            <div className="rounded-lg border p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Razorpay</p>
                  <p className="text-sm text-muted-foreground">Accept online payments via Razorpay</p>
                </div>
                <Switch
                  checked={watch("paymentGateways.razorpay.enabled")}
                  onCheckedChange={(c) => setValue("paymentGateways.razorpay.enabled", !!c)}
                />
              </div>
              {watch("paymentGateways.razorpay.enabled") && (
                <div className="space-y-3 pt-2 border-t">
                  <div>
                    <Label>Display Name</Label>
                    <Input {...register("paymentGateways.razorpay.displayName")} />
                  </div>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div>
                      <Label>Key ID</Label>
                      <Input {...register("paymentGateways.razorpay.keyId")} placeholder="rzp_test_..." />
                    </div>
                    <div>
                      <Label>Key Secret</Label>
                      <Input type="password" {...register("paymentGateways.razorpay.keySecret")} placeholder="Enter key secret" />
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground">Leave blank to use environment variables.</p>
                </div>
              )}
            </div>

            {/* Stripe */}
            <div className="rounded-lg border p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Stripe</p>
                  <p className="text-sm text-muted-foreground">Accept payments via Stripe</p>
                </div>
                <Switch
                  checked={watch("paymentGateways.stripe.enabled")}
                  onCheckedChange={(c) => setValue("paymentGateways.stripe.enabled", !!c)}
                />
              </div>
              {watch("paymentGateways.stripe.enabled") && (
                <div className="space-y-3 pt-2 border-t">
                  <div>
                    <Label>Display Name</Label>
                    <Input {...register("paymentGateways.stripe.displayName")} />
                  </div>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div>
                      <Label>Publishable Key</Label>
                      <Input {...register("paymentGateways.stripe.publishableKey")} placeholder="pk_test_..." />
                    </div>
                    <div>
                      <Label>Secret Key</Label>
                      <Input type="password" {...register("paymentGateways.stripe.secretKey")} placeholder="sk_test_..." />
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground">Leave blank to use environment variables.</p>
                </div>
              )}
            </div>

            {/* COD */}
            <div className="rounded-lg border p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Cash on Delivery</p>
                  <p className="text-sm text-muted-foreground">Allow payment at delivery time</p>
                </div>
                <Switch
                  checked={watch("paymentGateways.cod.enabled")}
                  onCheckedChange={(c) => setValue("paymentGateways.cod.enabled", !!c)}
                />
              </div>
              {watch("paymentGateways.cod.enabled") && (
                <div className="space-y-3 pt-2 border-t">
                  <div>
                    <Label>Display Name</Label>
                    <Input {...register("paymentGateways.cod.displayName")} />
                  </div>
                  <div>
                    <Label>Instructions</Label>
                    <Textarea {...register("paymentGateways.cod.instructions")} rows={2} />
                  </div>
                </div>
              )}
            </div>

            {/* Bank Transfer */}
            <div className="rounded-lg border p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Bank Transfer</p>
                  <p className="text-sm text-muted-foreground">Accept direct bank transfers</p>
                </div>
                <Switch
                  checked={watch("paymentGateways.bankTransfer.enabled")}
                  onCheckedChange={(c) => setValue("paymentGateways.bankTransfer.enabled", !!c)}
                />
              </div>
              {watch("paymentGateways.bankTransfer.enabled") && (
                <div className="space-y-3 pt-2 border-t">
                  <div>
                    <Label>Display Name</Label>
                    <Input {...register("paymentGateways.bankTransfer.displayName")} />
                  </div>
                  <div>
                    <Label>Instructions</Label>
                    <Textarea {...register("paymentGateways.bankTransfer.instructions")} rows={2} />
                  </div>
                  <div>
                    <Label>Account Details</Label>
                    <Textarea
                      {...register("paymentGateways.bankTransfer.accountDetails")}
                      rows={3}
                      placeholder={"Bank: State Bank of India\nAccount: 1234567890\nIFSC: SBIN0001234\nName: Sweet Delights Bakery"}
                    />
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Button type="submit" size="lg">
          Save Settings
        </Button>
      </form>
    </div>
  );
}
