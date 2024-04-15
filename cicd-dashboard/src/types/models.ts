export interface Tab {
  name: string;
  level: "component";
  description: string;
  repos?: Repo[];
}

export interface Repo {
  name: string;
  level: "repo";
  description: string;
  url: string;
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
