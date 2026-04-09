const { execSync } = require('child_process');

const args = process.argv.slice(2);
const message = args[0] || 'auto-commit: update';

try {
  console.log('📦 Staging changes...');
  execSync('git add .', { stdio: 'inherit' });

  console.log(`\n💾 Committing changes with message: "${message}"`);
  execSync(`git commit -m "${message}"`, { stdio: 'inherit' });
} catch (error) {
  console.log('\n✅ No changes to commit, proceeding to push...');
}

try {
  console.log('\n🚀 Pushing to origin main...');
  execSync('git push origin main', { stdio: 'inherit' });
  console.log('\n🎉 Successfully pushed to GitHub! Vercel will now deploy automatically.');
} catch (error) {
  console.error('\n❌ Failed to push. Please check your git status.');
  process.exit(1);
}
