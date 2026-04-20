import Link from "next/link";
import { Button, Result } from "antd";
import { HomeOutlined } from "@ant-design/icons";

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <Result
        status="404"
        title="404"
        subTitle="Sorry, the page you visited does not exist."
        extra={
          <Link href="/home">
            <Button
              type="primary"
              size="large"
              icon={<HomeOutlined />}
              className="bg-[#00623B]">
              Back Home
            </Button>
          </Link>
        }
      />
    </div>
  );
}
