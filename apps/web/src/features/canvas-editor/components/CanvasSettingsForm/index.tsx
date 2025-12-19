"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useId, useTransition } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Textarea } from "@/components/ui/textarea";
import { updateCanvasAction } from "../../actions/canvas-actions";
import { UpdateCanvasFormSchema, type UpdateCanvasFormValues } from "../../schemas/canvas-schema";

type CanvasSettingsFormProps = {
  canvasId: string;
  defaultValues: UpdateCanvasFormValues;
  onSuccessAction?: () => void;
};

/**
 * キャンバス設定フォーム（タイトル、説明、公開設定）
 *
 * React Hook Form + Zod + Server Actionsで実装
 */
export const CanvasSettingsForm = ({
  canvasId,
  defaultValues,
  onSuccessAction,
}: CanvasSettingsFormProps) => {
  const [isPending, startTransition] = useTransition();
  const publicOptionId = useId();
  const privateOptionId = useId();

  const form = useForm<UpdateCanvasFormValues>({
    resolver: zodResolver(UpdateCanvasFormSchema),
    defaultValues,
  });

  const onSubmit = (values: UpdateCanvasFormValues) => {
    startTransition(() => {
      updateCanvasAction(canvasId, {
        title: values.title,
        description: values.description,
        isPublic: values.isPublic,
      }).then((data) => {
        if (data.success) {
          toast.success("キャンバス設定を更新しました");
          onSuccessAction?.();
        }

        if (!data.success) {
          toast.error(data.error);
        }
      });
    });
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* タイトル */}
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>タイトル</FormLabel>
              <FormControl>
                <Input {...field} disabled={isPending} placeholder="キャンバスのタイトル" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* 説明 */}
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>説明（任意）</FormLabel>
              <FormControl>
                <Textarea {...field} disabled={isPending} placeholder="キャンバスの説明" rows={3} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* 公開設定 */}
        <FormField
          control={form.control}
          name="isPublic"
          render={({ field }) => (
            <FormItem>
              <FormLabel>公開設定</FormLabel>
              <FormControl>
                <RadioGroup
                  onValueChange={(value) => field.onChange(value === "public")}
                  value={field.value ? "public" : "private"}
                  disabled={isPending}
                  className="flex flex-col space-y-1"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="private" id={privateOptionId} />
                    <Label htmlFor={privateOptionId}>非公開（自分のみ閲覧可能）</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="public" id={publicOptionId} />
                    <Label htmlFor={publicOptionId}>公開（URLを知っている人が閲覧可能）</Label>
                  </div>
                </RadioGroup>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" disabled={isPending || !form.formState.isDirty}>
          {isPending ? "保存中..." : "設定を保存"}
        </Button>
      </form>
    </Form>
  );
};
