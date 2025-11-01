'use client';

import React, { useState } from 'react';
import { Form, Input, Button, Divider, App } from 'antd';
import { UserOutlined, MailOutlined, LockOutlined, GoogleOutlined } from '@ant-design/icons';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/utils/api';
import { API_ENDPOINTS, APP_ROUTES } from '@/lib/constants';

export function RegisterForm() {
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();
  const router = useRouter();
  const { message } = App.useApp();

  const handleSubmit = async (values: RegisterData & { confirmPassword: string }) => {
    setLoading(true);

    try {
      const { confirmPassword, ...registerData } = values;
      const response = await api.post(API_ENDPOINTS.REGISTER, registerData);

      message.success('Registration successful! Please verify your account.');
      
      // Store email for OTP verification
      localStorage.setItem('verificationEmail', registerData.email);
      
      setTimeout(() => {
        router.push(APP_ROUTES.OTP);
      }, 1500);
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || 'Registration failed. Please try again.';
      message.error(errorMessage);
      console.error('Registration error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleOAuthRegister = () => {
    message.info('OAuth registration will be implemented soon');
  };

  return (
    <div className="w-full max-w-md">
      <h1 className="text-3xl font-semibold mb-2">Sign up</h1>
      <p className="text-sm text-gray-600 mb-8">
        By signing up, you are consenting to receive product, service and events
        updates from us. You can unsubscribe at any time.
      </p>

      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        autoComplete="on"
        size="large"
      >
        <Form.Item
          name="userName"
          label="Username"
          rules={[
            { required: true, message: 'Please enter your username' },
            { min: 3, message: 'Username must be at least 3 characters' },
            { max: 20, message: 'Username must not exceed 20 characters' },
            { pattern: /^[a-zA-Z0-9_]+$/, message: 'Username can only contain letters, numbers, and underscores' },
          ]}
        >
          <Input
            prefix={<UserOutlined className="text-gray-400" />}
            placeholder="Enter your username"
            autoComplete="username"
          />
        </Form.Item>

        <div className="grid grid-cols-2 gap-4">
          <Form.Item
            name="firstName"
            label="First name"
            rules={[{ required: true, message: 'Required' }]}
          >
            <Input
              placeholder="First name"
              autoComplete="given-name"
            />
          </Form.Item>

          <Form.Item
            name="lastName"
            label="Last name"
            rules={[{ required: true, message: 'Required' }]}
          >
            <Input
              placeholder="Last name"
              autoComplete="family-name"
            />
          </Form.Item>
        </div>

        <Form.Item
          name="email"
          label="Email address"
          rules={[
            { required: true, message: 'Please enter your email' },
            { type: 'email', message: 'Please enter a valid email' },
          ]}
        >
          <Input
            prefix={<MailOutlined className="text-gray-400" />}
            placeholder="youremail@example.com"
            autoComplete="email"
          />
        </Form.Item>

        <Form.Item
          name="password"
          label="Password"
          rules={[
            { required: true, message: 'Please enter your password' },
            { min: 8, message: 'Password must be at least 8 characters' },
            {
              pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
              message: 'Password must contain uppercase, lowercase, and number',
            },
          ]}
          hasFeedback
        >
          <Input.Password
            prefix={<LockOutlined className="text-gray-400" />}
            placeholder="Enter your password"
            autoComplete="new-password"
          />
        </Form.Item>

        <Form.Item
          name="confirmPassword"
          label="Confirm Password"
          dependencies={['password']}
          hasFeedback
          rules={[
            { required: true, message: 'Please confirm your password' },
            ({ getFieldValue }) => ({
              validator(_, value) {
                if (!value || getFieldValue('password') === value) {
                  return Promise.resolve();
                }
                return Promise.reject(new Error('Passwords do not match'));
              },
            }),
          ]}
        >
          <Input.Password
            prefix={<LockOutlined className="text-gray-400" />}
            placeholder="Confirm your password"
            autoComplete="new-password"
          />
        </Form.Item>

        <Form.Item className="mb-4">
          <div className="flex items-center gap-4">
            <Button
              type="primary"
              htmlType="submit"
              loading={loading}
              className="flex-1 h-11"
            >
              {loading ? 'Creating account...' : 'Create account'}
            </Button>
            <span className="text-gray-500">Or</span>
            <Button
              icon={<GoogleOutlined />}
              onClick={handleOAuthRegister}
              className="h-11 w-11"
            />
          </div>
        </Form.Item>

        <div className="text-center text-gray-600">
          Already have an account?{' '}
          <Link href={APP_ROUTES.LOGIN} className="text-[#00623B] hover:underline font-medium">
            Sign In
          </Link>
        </div>
      </Form>
    </div>
  );
}
