"use client";

import React from "react";
import { Form } from "antd";
import type { FormInstance, Rule } from "antd/es/form";
import type { FieldConfig } from "@/lib/config";
import { AppButton } from "./AppButton";
import { AppInput } from "./AppInput";
import { AppSelect } from "./AppSelect";
import { AppTextarea } from "./AppTextarea";

export interface ConfigDrivenFormProps<T extends Record<string, unknown>> {
  fields: FieldConfig[];
  initialValues?: Partial<T>;
  submitLabel?: string;
  loading?: boolean;
  onSubmit: (values: T, form: FormInstance<T>) => void | Promise<void>;
}

function buildRules(field: FieldConfig): Rule[] {
  const rules: Rule[] = [];

  if (field.required) {
    rules.push({ required: true, message: `${field.label} is required.` });
  }

  if (field.minLength) {
    rules.push({
      min: field.minLength,
      message: `${field.label} must be at least ${field.minLength} characters.`,
    });
  }

  if (field.maxLength) {
    rules.push({
      max: field.maxLength,
      message: `${field.label} must be at most ${field.maxLength} characters.`,
    });
  }

  return rules;
}

export function ConfigDrivenForm<T extends Record<string, unknown>>({
  fields,
  initialValues,
  submitLabel = "Submit",
  loading,
  onSubmit,
}: ConfigDrivenFormProps<T>): React.ReactElement {
  const [form] = Form.useForm<T>();

  return (
    <Form<T>
      form={form}
      layout="vertical"
      initialValues={initialValues as T}
      onFinish={(values) => onSubmit(values, form)}>
      {fields.map((field) => {
        const rules = buildRules(field);

        return (
          <Form.Item
            key={field.name}
            name={field.name}
            label={field.label}
            rules={rules}>
            {field.type === "textarea" ? (
              <AppTextarea placeholder={field.placeholder} rows={4} />
            ) : field.type === "select" || field.type === "multiselect" ? (
              <AppSelect
                mode={field.type === "multiselect" ? "multiple" : undefined}
                placeholder={field.placeholder}
                options={field.options}
              />
            ) : (
              <AppInput
                type={
                  field.type === "password" ||
                  field.type === "email" ||
                  field.type === "number"
                    ? field.type
                    : "text"
                }
                placeholder={field.placeholder}
              />
            )}
          </Form.Item>
        );
      })}

      <Form.Item>
        <AppButton type="submit" fullWidth loading={loading}>
          {submitLabel}
        </AppButton>
      </Form.Item>
    </Form>
  );
}
