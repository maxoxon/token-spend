"""Runs bin/aggregate.py on a throwaway HOME with one invented transcript and checks the numbers."""
import json, os, subprocess, sys, tempfile, unittest

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))


def line(mid, out, ts='2026-01-05T10:00:00Z', cwd='/home/dev/my-app/src'):
    return json.dumps({
        'type': 'assistant', 'timestamp': ts, 'cwd': cwd,
        'message': {'id': mid, 'model': 'claude-sonnet-5-5', 'usage': {
            'input_tokens': 10, 'output_tokens': out, 'cache_read_input_tokens': 1000,
            'cache_creation_input_tokens': 0}},
    })


class Aggregate(unittest.TestCase):
    def test_turns_are_counted_once_and_named_after_the_launch_folder(self):
        with tempfile.TemporaryDirectory() as home:
            proj = os.path.join(home, '.claude', 'projects', '-home-dev-my-app')
            os.makedirs(proj)
            with open(os.path.join(proj, 's.jsonl'), 'w') as f:
                # the same message twice (the larger output wins), then one more turn from a subfolder
                f.write('\n'.join([line('m1', 5, cwd='/home/dev/my-app'), line('m1', 50, cwd='/home/dev/my-app'),
                                   line('m2', 7, cwd='/home/dev/my-app/src')]) + '\n')
            env = {**os.environ, 'HOME': home, 'LANG': 'en_US.UTF-8'}
            r = subprocess.run([sys.executable, '-I', os.path.join(ROOT, 'bin', 'aggregate.py')],
                               env=env, capture_output=True, text=True)
            self.assertEqual(r.returncode, 0, r.stderr)
            stats = json.load(open(os.path.join(home, '.claude', 'token-spend', 'stats.json')))
            self.assertEqual(stats['turns'], 2)
            self.assertEqual(len(stats['rows']), 1)
            day, model, project, n, tin, tout = stats['rows'][0][:6]
            self.assertEqual((model, project, n, tin, tout), ('claude-sonnet-5-5', 'my-app', 2, 20, 57))


if __name__ == '__main__':
    unittest.main()
