export interface Component {
  name: string;
  level: "component" | "repo";
  description: string;
  url: string;
  sub: Component[];
  workflows?: Workflow[];
}

export interface Workflow {
  file: string;
  name: string;
  url: string;
}

export interface RunDetails {
  id: number;
  url: string;
  workflow: string;
  run_name: string;
  run_number: number;
  time: string;
  user: string;
  branch: string;
  status: string;
  isqa: boolean;
  test_result: string;
  s3_urls: string;
}
